import { defineEnvVars } from '@sveltejs/kit/env';

// Values come from `.env` in `vp dev` and the build, and from the Worker's vars/secrets at runtime.
export const variables = defineEnvVars({
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173`.',
		schema: (value) => {
			if (!value || !URL.canParse(value)) throw new Error('ORIGIN must be an absolute URL');
			return value;
		}
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. At least 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).',
		schema: (value) => {
			if (!value || value.length < 32)
				throw new Error('BETTER_AUTH_SECRET must be at least 32 characters');
			return value;
		}
	},
	// Both empty locally: purging is skipped in dev, and a deployed Worker without them logs a warning
	// instead of purging (src/lib/server/providers/cloudflare/purge.ts).
	CACHE_PURGE_ZONE_ID: {
		description:
			'Cloudflare zone ID of the site domain, for purging cached pages by URL. Not secret; a Worker var.',
		schema: (value) => {
			if (value && !/^[0-9a-f]{32}$/.test(value))
				throw new Error('CACHE_PURGE_ZONE_ID must be a 32-character hex zone ID');
			return value ?? '';
		}
	},
	CACHE_PURGE_TOKEN: {
		description:
			'Cloudflare API token with only the Zone > Cache Purge permission on that zone. Secret.',
		schema: (value) => value ?? ''
	}
});
