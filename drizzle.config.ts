import { defineConfig } from 'drizzle-kit';

const {
	CLOUDFLARE_ACCOUNT_ID: accountId,
	CLOUDFLARE_DATABASE_ID: databaseId,
	CLOUDFLARE_D1_TOKEN: token
} = process.env;

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	// Remote D1 credentials are only needed by push/migrate/studio; `generate` works without them.
	...(accountId && databaseId && token
		? { driver: 'd1-http', dbCredentials: { accountId, databaseId, token } }
		: {}),
	verbose: true,
	strict: true
});
