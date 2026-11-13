import { defineConfig } from '@playwright/test';

export default defineConfig({
	// The home page reads D1: apply migrations to the LOCAL database (Wrangler's emulation) first.
	webServer: {
		command: 'vp run db:migrate:local && vp run build && vp run preview',
		port: 4173
	},
	testMatch: '**/*.e2e.{ts,js}'
});
