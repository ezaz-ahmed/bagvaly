import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { DELIVERY_ZONES } from '#lib/delivery.ts';
import {
	categories,
	customers,
	ORDER_STATUSES,
	orderEvents,
	orderItems,
	orders,
	products,
	productVariants,
	type OrderStatus,
	type ProductStatus
} from '#lib/server/db/schema.ts';
import { createTestDb } from '#lib/server/db/test-db.ts';
import { createOrder } from './create';
import { checkoutInputSchema } from './schemas';
import { changeStatus, ORDER_TRANSITIONS } from './status';

let t: Awaited<ReturnType<typeof createTestDb>>;
let categoryId: number;
let seq = 0;

beforeAll(async () => {
	t = await createTestDb();
	[{ id: categoryId }] = await t.db
		.insert(categories)
		.values({ slug: 'tote', nameEn: 'Tote' })
		.returning({ id: categories.id });
});
afterAll(() => t.dispose());

/** A new product with one colour; returns the variant id. */
async function variant(stock: number, status: ProductStatus = 'published', price = 145_000) {
	const n = ++seq;
	const [product] = await t.db
		.insert(products)
		.values({ slug: `bag-${n}`, nameEn: `Bag ${n}`, categoryId, price, status, skuPrefix: `B${n}` })
		.returning({ id: products.id });
	const [row] = await t.db
		.insert(productVariants)
		.values({
			productId: product.id,
			colourNameEn: 'Black',
			colourNameBn: 'কালো',
			colourHex: '#292525',
			sku: `B${n}-BLK`,
			stock
		})
		.returning({ id: productVariants.id });
	return row.id;
}

/** Validated checkout input; each call gets a new customer and idempotency key. */
function checkout(items: { variantId: number; quantity: number }[], extra: object = {}) {
	const n = ++seq;
	return v.parse(checkoutInputSchema, {
		name: 'Test Customer',
		phone: `0171${String(n).padStart(7, '0')}`,
		districtId: 'dhaka',
		address: 'House 1, Road 2',
		items,
		idempotencyKey: crypto.randomUUID(),
		...extra
	});
}

const stockOf = async (id: number) =>
	(await t.db.query.productVariants.findFirst({ where: eq(productVariants.id, id) }))!.stock;
const orderRow = async (id: number) =>
	(await t.db.query.orders.findFirst({ where: eq(orders.id, id), with: { customer: true } }))!;

async function placed(stock = 5, quantity = 1) {
	const variantId = await variant(stock);
	const result = await createOrder(t.db, checkout([{ variantId, quantity }]));
	if (!result.ok) throw new Error(result.code);
	return { variantId, orderId: result.orderId };
}

describe('createOrder', () => {
	it('prices from D1, snapshots items, decrements stock and records the order', async () => {
		const a = await variant(3, 'published', 145_000);
		const b = await variant(1, 'hidden', 99_000);
		const input = checkout(
			[
				{ variantId: a, quantity: 2, price: 1 },
				{ variantId: b, quantity: 1, unitPrice: 1 }
			] as never,
			{ districtId: 'cumilla', utmSource: 'facebook', fbclid: 'abc', total: 1 }
		);
		const result = await createOrder(t.db, input);
		expect(result).toMatchObject({ ok: true, replayed: false });
		if (!result.ok) return;
		expect(result.number).toBe(`BV-${10_000 + result.orderId}`);

		const order = await orderRow(result.orderId);
		const subtotal = 2 * 145_000 + 99_000;
		expect(order).toMatchObject({
			status: 'pending',
			paymentMethod: 'cod',
			paymentStatus: 'unpaid',
			source: 'website',
			subtotal,
			deliveryZone: 'outside_dhaka',
			deliveryFee: DELIVERY_ZONES.outside_dhaka.fee,
			total: subtotal + DELIVERY_ZONES.outside_dhaka.fee,
			utmSource: 'facebook',
			fbclid: 'abc',
			customer: { phone: input.phone, ordersCount: 1 }
		});
		const items = await t.db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
		expect(items).toEqual([
			expect.objectContaining({
				variantId: a,
				unitPrice: 145_000,
				quantity: 2,
				lineTotal: 290_000
			}),
			expect.objectContaining({ variantId: b, colourNameBn: 'কালো', unitPrice: 99_000 })
		]);
		expect(await stockOf(a)).toBe(1);
		expect(await stockOf(b)).toBe(0);
		const events = await t.db.select().from(orderEvents).where(eq(orderEvents.orderId, order.id));
		expect(events).toMatchObject([
			{ type: 'status_change', message: 'pending', actor: 'customer' }
		]);
	});

	it('gives sequential order numbers', async () => {
		const first = await placed();
		const second = await placed();
		const numbers = await Promise.all([orderRow(first.orderId), orderRow(second.orderId)]);
		const [x, y] = numbers.map((o) => Number(o.number.slice(3)));
		expect(y).toBe(x + 1);
	});

	it('returns the same order on retry with the same idempotency key', async () => {
		const variantId = await variant(5);
		const input = checkout([{ variantId, quantity: 1 }]);
		const first = await createOrder(t.db, input);
		const [again, concurrent] = await Promise.all([
			createOrder(t.db, input),
			createOrder(t.db, input)
		]);
		expect(first).toMatchObject({ ok: true, replayed: false });
		for (const retry of [again, concurrent]) {
			expect(retry).toEqual({ ...first, replayed: true });
		}
		expect(await stockOf(variantId)).toBe(4);
	});

	it('deduplicates concurrent first submits with the same key', async () => {
		const variantId = await variant(5);
		const input = checkout([{ variantId, quantity: 1 }]);
		const results = await Promise.all([createOrder(t.db, input), createOrder(t.db, input)]);
		expect(results.every((r) => r.ok)).toBe(true);
		expect(new Set(results.map((r) => r.ok && r.orderId)).size).toBe(1);
		expect(await stockOf(variantId)).toBe(4);
	});

	it('sells the last unit exactly once when two orders race', async () => {
		const variantId = await variant(1);
		const results = await Promise.all([
			createOrder(t.db, checkout([{ variantId, quantity: 1 }])),
			createOrder(t.db, checkout([{ variantId, quantity: 1 }]))
		]);
		expect(results.filter((r) => r.ok)).toHaveLength(1);
		expect(results.filter((r) => !r.ok)).toEqual([
			{ ok: false, code: 'out_of_stock', variantIds: [variantId] }
		]);
		expect(await stockOf(variantId)).toBe(0);
	});

	it('relies on D1 rolling back the whole batch when the stock CHECK fails', async () => {
		const variantId = await variant(1);
		await expect(
			t.db.batch([
				t.db.insert(categories).values({ slug: 'rolled-back', nameEn: 'Rolled back' }),
				t.db.update(productVariants).set({ stock: -1 }).where(eq(productVariants.id, variantId))
			])
		).rejects.toThrow();
		expect(await t.db.$count(categories, eq(categories.slug, 'rolled-back'))).toBe(0);
		expect(await stockOf(variantId)).toBe(1);
	});

	it('rejects more than the stock without writing anything', async () => {
		const variantId = await variant(2);
		const input = checkout([{ variantId, quantity: 3 }]);
		expect(await createOrder(t.db, input)).toEqual({
			ok: false,
			code: 'out_of_stock',
			variantIds: [variantId]
		});
		expect(await stockOf(variantId)).toBe(2);
		expect(await t.db.query.customers.findFirst({ where: eq(customers.phone, input.phone) })).toBe(
			undefined
		);
	});

	it('rejects draft and unknown variants', async () => {
		const draft = await variant(5, 'draft');
		const ok = await variant(5);
		expect(
			await createOrder(
				t.db,
				checkout([
					{ variantId: ok, quantity: 1 },
					{ variantId: draft, quantity: 1 },
					{ variantId: 999_999, quantity: 1 }
				])
			)
		).toEqual({ ok: false, code: 'variant_unavailable', variantIds: [draft, 999_999] });
		expect(await stockOf(ok)).toBe(5);
	});

	it('refuses blocked customers', async () => {
		const variantId = await variant(5);
		const first = checkout([{ variantId, quantity: 1 }]);
		await createOrder(t.db, first);
		await t.db.update(customers).set({ isBlocked: true }).where(eq(customers.phone, first.phone));
		const again = checkout([{ variantId, quantity: 1 }], { phone: first.phone });
		expect(await createOrder(t.db, again)).toEqual({ ok: false, code: 'customer_blocked' });
		expect(await stockOf(variantId)).toBe(4);
	});

	it('finds the returning customer by any phone spelling and counts orders', async () => {
		const variantId = await variant(5);
		await createOrder(t.db, checkout([{ variantId, quantity: 1 }], { phone: '01999000111' }));
		await createOrder(
			t.db,
			checkout([{ variantId, quantity: 1 }], { phone: '+৮৮০ ১৯৯৯-০০০১১১', name: 'New Name' })
		);
		const rows = await t.db.select().from(customers).where(eq(customers.phone, '+8801999000111'));
		expect(rows).toMatchObject([{ ordersCount: 2, name: 'New Name' }]);
	});
});

describe('changeStatus', () => {
	const pathTo: Record<OrderStatus, OrderStatus[]> = {
		pending: [],
		confirmed: ['confirmed'],
		shipped: ['confirmed', 'shipped'],
		delivered: ['confirmed', 'shipped', 'delivered'],
		returned: ['confirmed', 'shipped', 'returned'],
		cancelled: ['cancelled']
	};

	async function orderIn(status: OrderStatus) {
		const created = await placed(5, 2);
		for (const step of pathTo[status]) {
			expect(await changeStatus(t.db, created.orderId, step, 'admin-1')).toEqual({ ok: true });
		}
		return created;
	}

	const pairs = ORDER_STATUSES.flatMap((from) => ORDER_STATUSES.map((to) => [from, to] as const));

	it.each(pairs)('%s -> %s follows the lifecycle', async (from, to) => {
		const { orderId } = await orderIn(from);
		const allowed = ORDER_TRANSITIONS[from].includes(to);
		expect(await changeStatus(t.db, orderId, to, 'admin-1')).toEqual(
			allowed ? { ok: true } : { ok: false, code: 'invalid_transition' }
		);
		expect((await orderRow(orderId)).status).toBe(allowed ? to : from);
	});

	it('allows exactly the AGENTS.md lifecycle', () => {
		expect(ORDER_TRANSITIONS).toEqual({
			pending: ['confirmed', 'cancelled'],
			confirmed: ['shipped', 'cancelled'],
			shipped: ['delivered', 'returned'],
			delivered: [],
			returned: [],
			cancelled: []
		});
	});

	it.each(['pending', 'confirmed'] as const)('restocks when a %s order is cancelled', async (s) => {
		const { orderId, variantId } = await orderIn(s);
		expect(await stockOf(variantId)).toBe(3);
		await changeStatus(t.db, orderId, 'cancelled', 'admin-1');
		expect(await stockOf(variantId)).toBe(5);
		const order = await orderRow(orderId);
		expect(order.customer).toMatchObject({ ordersCount: 1, deliveredCount: 0, returnedCount: 0 });
	});

	it('restocks and counts a return', async () => {
		const { orderId, variantId } = await orderIn('returned');
		expect(await stockOf(variantId)).toBe(5);
		const order = await orderRow(orderId);
		expect(order.paymentStatus).toBe('unpaid');
		expect(order.customer).toMatchObject({ deliveredCount: 0, returnedCount: 1 });
	});

	it('marks delivered orders collected and counts them, without restocking', async () => {
		const { orderId, variantId } = await orderIn('delivered');
		expect(await stockOf(variantId)).toBe(3);
		const order = await orderRow(orderId);
		expect(order.paymentStatus).toBe('collected');
		expect(order.customer).toMatchObject({ deliveredCount: 1, returnedCount: 0 });
		const events = await t.db
			.select({ message: orderEvents.message, actor: orderEvents.actor })
			.from(orderEvents)
			.where(eq(orderEvents.orderId, orderId))
			.orderBy(orderEvents.id);
		expect(events.map((e) => e.message)).toEqual(['pending', 'confirmed', 'shipped', 'delivered']);
		expect(events.slice(1).every((e) => e.actor === 'admin-1')).toBe(true);
	});

	it('applies only one of two concurrent changes', async () => {
		const { orderId, variantId } = await orderIn('confirmed');
		const results = await Promise.all([
			changeStatus(t.db, orderId, 'cancelled', 'admin-1'),
			changeStatus(t.db, orderId, 'cancelled', 'admin-2')
		]);
		expect(results).toContainEqual({ ok: true });
		expect(results.filter((r) => r.ok)).toHaveLength(1);
		expect(await stockOf(variantId)).toBe(5);
		expect(await t.db.$count(orderEvents, eq(orderEvents.orderId, orderId))).toBe(3);
	});

	it('returns not_found for an unknown order', async () => {
		expect(await changeStatus(t.db, 999_999, 'confirmed', 'admin-1')).toEqual({
			ok: false,
			code: 'not_found'
		});
	});
});
