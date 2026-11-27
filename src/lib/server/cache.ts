import { waitUntil } from 'cloudflare:workers';
import type { Handle } from '@sveltejs/kit/hooks';
import { building, dev } from '$app/env';
import { ORIGIN } from '$app/env/private';
import { locales, localizeUrl } from '#lib/paraglide/runtime.js';

// Edge cache for public, non-personalised GET pages (AGENTS.md section 11). Entries are keyed by
// the URL with only the query params pages read, so `/bn/...` and `?category=` pages are cached
// separately but ad tags (`fbclid`, `utm_*`, unique per click) do not create new entries.

/** How long a public page stays in the edge cache. Purges after edits make it fresher. */
export const PUBLIC_CACHE_TTL_SECONDS = 300;

/** The only query params public pages read; every other param is left out of the cache key. */
export const CACHE_KEY_PARAMS = ['category', 'sort', 'cursor'] as const;

/** `url` without unknown params, the kept ones in a fixed order (first value of each). */
export function cacheKey(url: string): string {
	const source = new URL(url);
	const key = new URL(source.pathname, source.origin);
	for (const param of CACHE_KEY_PARAMS) {
		const value = source.searchParams.get(param);
		if (value !== null) key.searchParams.set(param, value);
	}
	return key.href;
}

// Better Auth cookies (session token and cached session data), with or without `__Secure-`.
const SESSION_COOKIE = /(?:^|;\s*)(?:__Secure-)?better-auth\./;

function isCacheableRequest(request: Request): boolean {
	return (
		request.method === 'GET' &&
		!request.headers.has('authorization') &&
		!SESSION_COOKIE.test(request.headers.get('cookie') ?? '')
	);
}

function isCacheableResponse(response: Response): boolean {
	return (
		response.status === 200 &&
		!response.headers.has('set-cookie') &&
		!/\b(?:private|no-store)\b/i.test(response.headers.get('cache-control') ?? '')
	);
}

/**
 * Serves `request` from the edge cache, or renders it and stores the response when both the
 * request (GET, no session cookie, no Authorization) and the response (200, no Set-Cookie, not
 * private/no-store) are public. Pass-through in dev and while prerendering.
 */
export async function cachedPublic(
	request: Request,
	render: () => Promise<Response>
): Promise<Response> {
	if (dev || building || !isCacheableRequest(request)) return render();

	// The DOM lib's CacheStorage type shadows the Workers one, which has `default`.
	const cache = (caches as unknown as { default: Cache }).default;
	const key = cacheKey(request.url);
	const hit = await cache.match(key);
	if (hit) return hit;

	const rendered = await render();
	if (!isCacheableResponse(rendered)) return rendered;

	const response = new Response(rendered.body, rendered); // headers may be immutable
	// s-maxage: the edge keeps it for the TTL; browsers ignore it, so a purge reaches shoppers.
	response.headers.set('cache-control', `public, s-maxage=${PUBLIC_CACHE_TTL_SECONDS}`);
	waitUntil(cache.put(key, response.clone()));
	return response;
}

/**
 * A hook that caches the given public route IDs (e.g. `'/(shop)'`). Put it first in `sequence()`
 * so a cache hit skips the session lookup. Client-side navigation data (`__data.json`) is not
 * cached: purges only list page URLs, so a cached copy would outlive an admin edit.
 */
export function publicCacheHandle(routeIds: readonly string[]): Handle {
	return ({ event, resolve }) =>
		!event.isDataRequest && event.route.id && routeIds.includes(event.route.id)
			? cachedPublic(event.request, () => resolve(event))
			: resolve(event);
}

/**
 * Public URLs whose cached pages show `product`: home, shop, its category filter and the product
 * page, in every locale. Pass the old category too when a product moves.
 * shortcut: other sorts and later pages (`?sort=`, `?cursor=`) are not purged and expire after
 * the TTL; purge everything instead if that staleness becomes a problem.
 */
export function affectedUrls(
	product: { slug: string; categorySlugs: readonly string[] },
	origin: string = ORIGIN
): string[] {
	const paths = [
		'/',
		'/shop',
		...product.categorySlugs.map((slug) => `/shop?category=${encodeURIComponent(slug)}`),
		`/bags/${encodeURIComponent(product.slug)}`
	];
	const urls = new Set<string>();
	for (const locale of locales) {
		for (const path of paths) {
			urls.add(localizeUrl(new URL(path, origin), { locale }).href);
		}
	}
	return [...urls];
}
