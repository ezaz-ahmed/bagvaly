import type { User, Session } from 'better-auth';
import type { createAuth } from '#lib/server/auth.ts';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// adapter-cloudflare 8 does not populate `event.platform`; read bindings with
		// `import { env, waitUntil } from 'cloudflare:workers'` instead.

		interface Locals {
			user?: User;
			session?: Session;
			auth: ReturnType<typeof createAuth>;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
