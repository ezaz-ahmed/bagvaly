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

let auth: ReturnType<typeof createAuth> | undefined;

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// Bindings are unavailable while prerendering; prerendered pages are public and session-free.
	if (building) return resolve(event);

	// One instance per Worker isolate: building it is not free, and it holds no per-request state.
	event.locals.auth = auth ??= createAuth(env.DB);

	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

// Public storefront pages served from the edge cache. `/bn` reroutes to the same route ID; the
// cache key is the path plus page params, so each locale gets its own entry. Cart, checkout and
// order pages are personal and stay out. Only GETs are cached, so the product page's add-to-bag POST is not.
const handleCache = publicCacheHandle([
	'/(shop)',
	'/(shop)/shop',
	'/(shop)/bags/[slug]',
	'/(shop)/delivery',
	'/(shop)/contact',
	'/(shop)/track'
]);

export const handle: Handle = sequence(handleCache, handleParaglide, handleBetterAuth);
