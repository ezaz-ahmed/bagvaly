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
	}
});
