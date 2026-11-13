import { env } from 'cloudflare:workers';
import { building } from '$app/env';
import { createAuth } from '#lib/server/auth.ts';
import { publicCacheHandle } from '#lib/server/cache.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { type Handle, sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) =>
					html
						.replace('%paraglide.lang%', locale)
						.replace('%paraglide.dir%', getTextDirection(locale))
			}
		);
	});

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// Bindings are unavailable while prerendering; prerendered pages are public and session-free.
	if (building) return resolve(event);

	event.locals.auth = createAuth(env.DB);

	const { auth } = event.locals;
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

// Public storefront pages served from the edge cache. `/bn` reroutes to the same route ID; the
// cache key is the full URL, so each locale gets its own entry.
const handleCache = publicCacheHandle(['/(shop)']);

export const handle: Handle = sequence(handleCache, handleParaglide, handleBetterAuth);
