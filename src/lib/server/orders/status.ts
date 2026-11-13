import { and, eq, sql } from 'drizzle-orm';
import { countOrderOutcome } from '#lib/server/customers/index.ts';
import { isConstraintError, type Db } from '#lib/server/db/index.ts';
import { orderEvents, orders, productVariants, type OrderStatus } from '#lib/server/db/schema.ts';

/** The order lifecycle (AGENTS.md section 8). Anything not listed is refused. */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
	pending: ['confirmed', 'cancelled'],
	confirmed: ['shipped', 'cancelled'],
	shipped: ['delivered', 'returned'],
	delivered: [],
	returned: [],
	cancelled: []
};

export const canTransition = (from: OrderStatus, to: OrderStatus) =>
	ORDER_TRANSITIONS[from].includes(to);

export type ChangeStatusResult =
	| { ok: true }
	| { ok: false; code: 'not_found' | 'invalid_transition' | 'status_conflict' };

/**
 * The only way to change an order's status. Cancelling or returning puts the items back in stock,
 * delivering marks the COD payment collected, delivered/returned are counted on the customer, and
 * an order event is recorded, all in one D1 batch (one transaction).
 *
 * `actor` is `system` or the admin's user id. If the status changed since it was read (e.g. two
 * admins clicking at once), nothing is written and `status_conflict` is returned.
 */
export async function changeStatus(
	db: Db,
	orderId: number,
	to: OrderStatus,
	actor: string
): Promise<ChangeStatusResult> {
	const order = await db.query.orders.findFirst({
		where: eq(orders.id, orderId),
		columns: { status: true, customerId: true },
		with: { items: { columns: { variantId: true, quantity: true } } }
	});
	if (!order) return { ok: false, code: 'not_found' };
	const from = order.status;
	if (!canTransition(from, to)) return { ok: false, code: 'invalid_transition' };

	const restock = to === 'cancelled' || to === 'returned';
	try {
		await db.batch([
			// order_id resolves to NULL (NOT NULL violation, batch rolls back) unless the order is
			// still `from`, so of two concurrent changes only the first one applies.
			db.insert(orderEvents).values({
				orderId: sql`(select ${orders.id} from ${orders} where ${and(eq(orders.id, orderId), eq(orders.status, from))})`,
				type: 'status_change',
				message: to,
				actor
			}),
			db
				.update(orders)
				.set(to === 'delivered' ? { status: to, paymentStatus: 'collected' } : { status: to })
				.where(eq(orders.id, orderId)),
			// Items whose colour was deleted (variantId null) have nothing to restock.
			...order.items.flatMap(({ variantId, quantity }) =>
				restock && variantId !== null
					? [
							db
								.update(productVariants)
								.set({ stock: sql`${productVariants.stock} + ${quantity}` })
								.where(eq(productVariants.id, variantId))
						]
					: []
			),
			...(to === 'delivered' || to === 'returned'
				? [countOrderOutcome(db, order.customerId, to)]
				: [])
		]);
	} catch (error) {
		if (isConstraintError(error, 'order_events.order_id')) {
			return { ok: false, code: 'status_conflict' };
		}
		throw error;
	}
	return { ok: true };
}
