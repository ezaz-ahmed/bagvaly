import { eq, sql } from 'drizzle-orm';
import type { Db } from '#lib/server/db/index.ts';
import { customers } from '#lib/server/db/schema.ts';

// Customer rules: one row per canonical phone, blocking, and order/delivered/returned counts.
// Functions returning a query builder are not awaited here; callers put them in a D1 batch.

/** `phone` must already be canonical (normalizeBdPhone). */
export async function findCustomerByPhone(db: Db, phone: string) {
	return db.query.customers.findFirst({ where: eq(customers.phone, phone) });
}

/**
 * Creates the customer or, for a returning one, updates the name to the latest checkout name,
 * and counts the new order. Does not check blocking; the caller does that first.
 */
export function upsertCustomerOnOrder(db: Db, phone: string, name: string) {
	return db
		.insert(customers)
		.values({ phone, name, ordersCount: 1 })
		.onConflictDoUpdate({
			target: customers.phone,
			set: { name, ordersCount: sql`${customers.ordersCount} + 1` }
		});
}

/** Counts a delivered or returned order for the customer. */
export function countOrderOutcome(db: Db, customerId: number, outcome: 'delivered' | 'returned') {
	const set =
		outcome === 'delivered'
			? { deliveredCount: sql`${customers.deliveredCount} + 1` }
			: { returnedCount: sql`${customers.returnedCount} + 1` };
	return db.update(customers).set(set).where(eq(customers.id, customerId));
}
