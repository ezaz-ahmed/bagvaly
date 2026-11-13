import { eq, inArray, sql } from 'drizzle-orm';
import { DELIVERY_ZONES, zoneForDistrict } from '#lib/delivery.ts';
import { findCustomerByPhone, upsertCustomerOnOrder } from '#lib/server/customers/index.ts';
import { isConstraintError, type Db } from '#lib/server/db/index.ts';
import {
	customers,
	orderEvents,
	orderItems,
	orders,
	products,
	productVariants
} from '#lib/server/db/schema.ts';
import type { CheckoutInput } from './schemas';

/** Order numbers are `BV-` + (this + order id), so the first order is BV-10001. */
export const ORDER_NUMBER_BASE = 10_000;

export type CreateOrderResult =
	| { ok: true; orderId: number; number: string; total: number; replayed: boolean }
	| { ok: false; code: 'customer_blocked' }
	| { ok: false; code: 'variant_unavailable' | 'out_of_stock'; variantIds: number[] };

/**
 * Places a website COD order from validated checkout input (see checkoutInputSchema).
 *
 * Prices, names and stock come from D1, never from the input. `published` and `hidden` products
 * can be bought (hidden only leaves listings; its link still works); `draft` cannot. The order,
 * its items, the stock decrement, the customer upsert and the first event are one D1 batch, which
 * D1 runs as a single transaction (see docs/decisions.md). Retrying with the same idempotency key
 * returns the first order instead of creating another.
 */
export async function createOrder(db: Db, input: CheckoutInput): Promise<CreateOrderResult> {
	const existing = await findByIdempotencyKey(db, input.idempotencyKey);
	if (existing) return { ok: true, ...existing, replayed: true };

	const customer = await findCustomerByPhone(db, input.phone);
	if (customer?.isBlocked) return { ok: false, code: 'customer_blocked' };

	const zone = zoneForDistrict(input.districtId);
	if (!zone) throw new Error(`Unknown district: ${input.districtId}`); // checkoutInputSchema prevents this

	const variantIds = input.items.map((item) => item.variantId);
	const rows = await db
		.select({
			variantId: productVariants.id,
			productId: products.id,
			status: products.status,
			price: products.price,
			stock: productVariants.stock,
			productNameEn: products.nameEn,
			productNameBn: products.nameBn,
			colourNameEn: productVariants.colourNameEn,
			colourNameBn: productVariants.colourNameBn
		})
		.from(productVariants)
		.innerJoin(products, eq(productVariants.productId, products.id))
		.where(inArray(productVariants.id, variantIds));
	const byId = new Map(rows.map((row) => [row.variantId, row]));

	const unavailable = variantIds.filter((id) => (byId.get(id)?.status ?? 'draft') === 'draft');
	if (unavailable.length > 0) {
		return { ok: false, code: 'variant_unavailable', variantIds: unavailable };
	}

	const lines = input.items.map(({ variantId, quantity }) => {
		const row = byId.get(variantId)!;
		return { ...row, quantity, lineTotal: row.price * quantity };
	});
	const short = lines.filter((line) => line.stock < line.quantity).map((line) => line.variantId);
	if (short.length > 0) return { ok: false, code: 'out_of_stock', variantIds: short };

	const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
	const deliveryFee = DELIVERY_ZONES[zone].fee;
	// Resolved inside the batch, so no statement depends on an id read before it ran.
	const orderId = sql`(select ${orders.id} from ${orders} where ${orders.idempotencyKey} = ${input.idempotencyKey})`;

	try {
		const [, [created]] = await db.batch([
			upsertCustomerOnOrder(db, input.phone, input.name),
			db
				.insert(orders)
				.values({
					// D1 serialises writes, so this cannot race; orders are never deleted, so it is base + id.
					// cast: D1 binds JS numbers as REAL, which would print as `BV-10001.0`.
					number: sql`'BV-' || (select cast(coalesce(max(${orders.id}), 0) + ${ORDER_NUMBER_BASE + 1} as integer) from ${orders})`,
					customerId: sql`(select ${customers.id} from ${customers} where ${customers.phone} = ${input.phone})`,
					subtotal,
					deliveryFee,
					total: subtotal + deliveryFee,
					deliveryZone: zone,
					districtId: input.districtId,
					address: input.address,
					areaLandmark: input.areaLandmark,
					customerNote: input.note,
					utmSource: input.utmSource,
					utmMedium: input.utmMedium,
					utmCampaign: input.utmCampaign,
					utmContent: input.utmContent,
					utmTerm: input.utmTerm,
					fbclid: input.fbclid,
					idempotencyKey: input.idempotencyKey
				})
				.returning({ orderId: orders.id, number: orders.number, total: orders.total }),
			db.insert(orderItems).values(
				lines.map((line) => ({
					orderId,
					productId: line.productId,
					variantId: line.variantId,
					productNameEn: line.productNameEn,
					productNameBn: line.productNameBn,
					colourNameEn: line.colourNameEn,
					colourNameBn: line.colourNameBn,
					unitPrice: line.price,
					quantity: line.quantity,
					lineTotal: line.lineTotal
				}))
			),
			db
				.insert(orderEvents)
				.values({ orderId, type: 'status_change', message: 'pending', actor: 'customer' }),
			// stock >= 0 is a CHECK: if another order took the stock meanwhile, this fails and the
			// whole batch rolls back.
			...lines.map((line) =>
				db
					.update(productVariants)
					.set({ stock: sql`${productVariants.stock} - ${line.quantity}` })
					.where(eq(productVariants.id, line.variantId))
			)
		]);
		return { ok: true, ...created, replayed: false };
	} catch (error) {
		if (isConstraintError(error, 'orders.idempotency_key')) {
			// A concurrent submit with the same key won the race.
			const winner = await findByIdempotencyKey(db, input.idempotencyKey);
			if (winner) return { ok: true, ...winner, replayed: true };
		}
		if (isConstraintError(error, 'product_variants_stock_check')) {
			const now = await db
				.select({ variantId: productVariants.id, stock: productVariants.stock })
				.from(productVariants)
				.where(inArray(productVariants.id, variantIds));
			const stock = new Map(now.map((row) => [row.variantId, row.stock]));
			const gone = lines
				.filter((line) => (stock.get(line.variantId) ?? 0) < line.quantity)
				.map((line) => line.variantId);
			return { ok: false, code: 'out_of_stock', variantIds: gone.length > 0 ? gone : variantIds };
		}
		throw error;
	}
}

async function findByIdempotencyKey(db: Db, idempotencyKey: string) {
	const [row] = await db
		.select({ orderId: orders.id, number: orders.number, total: orders.total })
		.from(orders)
		.where(eq(orders.idempotencyKey, idempotencyKey));
	return row;
}
