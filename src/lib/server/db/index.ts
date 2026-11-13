import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export const getDb = (d1: D1Database) => drizzle(d1, { schema });

export type Db = ReturnType<typeof getDb>;

/**
 * True when a D1 error (or its cause) is a SQLite constraint failure naming `target`: a column
 * such as `orders.idempotency_key`, or a CHECK name such as `product_variants_stock_check`.
 */
export function isConstraintError(error: unknown, target: string): boolean {
	for (let e = error; e instanceof Error; e = e.cause) {
		if (/constraint failed/i.test(e.message) && e.message.includes(target)) return true;
	}
	return false;
}
