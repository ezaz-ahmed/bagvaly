import { and, asc, eq } from 'drizzle-orm';
import type { Db } from '#lib/server/db/index.ts';
import { orderItems, orders } from '#lib/server/db/schema.ts';

/** httpOnly cookie holding the checkout key, so this browser can open its own confirmation page. */
export const ORDER_ACCESS_COOKIE = 'bv_order';

/**
 * The order for its confirmation page, only when `accessKey` (the checkout's idempotency key,
 * kept in an httpOnly cookie) matches. Order numbers are sequential, so the number alone must never
 * reveal an order.
 */
export async function getOrderForCustomer(db: Db, number: string, accessKey: string) {
	const order = await db.query.orders.findFirst({
		where: and(eq(orders.number, number), eq(orders.idempotencyKey, accessKey)),
		columns: {
			number: true,
			status: true,
			subtotal: true,
			deliveryFee: true,
			total: true,
			deliveryZone: true,
			districtId: true,
			paymentMethod: true
		},
		with: {
			customer: { columns: { phone: true } },
			items: {
				columns: {
					productNameEn: true,
					productNameBn: true,
					colourNameEn: true,
					colourNameBn: true,
					quantity: true,
					lineTotal: true
				},
				orderBy: [asc(orderItems.id)]
			}
		}
	});
	return order ?? null;
}
