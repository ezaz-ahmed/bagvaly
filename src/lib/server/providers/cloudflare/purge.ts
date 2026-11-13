import * as v from 'valibot';
import { dev } from '$app/env';
import { CACHE_PURGE_TOKEN, CACHE_PURGE_ZONE_ID } from '$app/env/private';

/** "Max operations per request" for purge by URL on Free/Pro/Business plans (Cloudflare docs, 2026-11). */
export const PURGE_URLS_PER_REQUEST = 100;

const purgeResponseSchema = v.object({ success: v.literal(true) });

/**
 * Purges absolute URLs from Cloudflare's cache in every data center (single-file purge API).
 * This also clears entries stored with the Workers Cache API on the zone's custom domain, which
 * `cache.delete()` would only clear in the current data center.
 *
 * Returns false when skipped: always in dev, and with a warning when the zone ID or token is
 * unset in a deployed Worker. Throws when Cloudflare rejects the request.
 */
export async function purgeUrls(urls: string[]): Promise<boolean> {
	if (dev || urls.length === 0) return false;
	if (!CACHE_PURGE_ZONE_ID || !CACHE_PURGE_TOKEN) {
		console.warn('[cache] purge skipped: CACHE_PURGE_ZONE_ID or CACHE_PURGE_TOKEN is not set');
		return false;
	}

	const endpoint = `https://api.cloudflare.com/client/v4/zones/${CACHE_PURGE_ZONE_ID}/purge_cache`;
	for (let i = 0; i < urls.length; i += PURGE_URLS_PER_REQUEST) {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${CACHE_PURGE_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ files: urls.slice(i, i + PURGE_URLS_PER_REQUEST) })
		});
		const body: unknown = await response.json().catch(() => null);
		if (!response.ok || !v.is(purgeResponseSchema, body)) {
			throw new Error(`Cloudflare cache purge failed with HTTP ${response.status}`);
		}
	}
	return true;
}
