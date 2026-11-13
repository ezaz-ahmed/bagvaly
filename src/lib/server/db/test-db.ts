import { migrate } from 'drizzle-orm/d1/migrator';
import { getPlatformProxy } from 'wrangler';
import { getDb } from './index';

/**
 * Test-only: an in-memory local D1 (Miniflare, via Wrangler) with every migration in `drizzle/`
 * applied. Start one per test file in `beforeAll` and `dispose()` it in `afterAll`; each call
 * gets an empty database.
 */
export async function createTestDb() {
	const proxy = await getPlatformProxy<{ DB: D1Database }>({
		persist: false,
		remoteBindings: false,
		envFiles: []
	});
	const db = getDb(proxy.env.DB);
	await migrate(db, { migrationsFolder: 'drizzle' });
	return { db, d1: proxy.env.DB, dispose: proxy.dispose };
}
