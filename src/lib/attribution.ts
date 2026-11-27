/**
 * Campaign attribution (UTM and fbclid), kept with the order (AGENTS.md section 13). Landing pages
 * are edge-cached, so the browser stores it: a Set-Cookie would keep the page out of the cache.
 */
export const ATTRIBUTION_COOKIE = 'bv_attr';

export const ATTRIBUTION_PARAMS = {
	utm_source: 'utmSource',
	utm_medium: 'utmMedium',
	utm_campaign: 'utmCampaign',
	utm_content: 'utmContent',
	utm_term: 'utmTerm',
	fbclid: 'fbclid'
} as const;

type AttributionKey = (typeof ATTRIBUTION_PARAMS)[keyof typeof ATTRIBUTION_PARAMS];
export type Attribution = Partial<Record<AttributionKey, string>>;

// checkoutInputSchema uses these limits too, so a long tracking value never blocks an order.
export const ATTRIBUTION_MAX_LENGTH: Record<AttributionKey, number> = {
	utmSource: 200,
	utmMedium: 200,
	utmCampaign: 200,
	utmContent: 200,
	utmTerm: 200,
	fbclid: 500
};

/** Attribution in `url`, or null when it has none (so a later plain visit keeps the last campaign). */
export function attributionFromUrl(url: URL): Attribution | null {
	const found: Attribution = {};
	for (const [param, key] of Object.entries(ATTRIBUTION_PARAMS)) {
		const value = url.searchParams.get(param)?.trim();
		if (value) found[key] = value.slice(0, ATTRIBUTION_MAX_LENGTH[key]);
	}
	return Object.keys(found).length ? found : null;
}

/** Reads the cookie value back, keeping only known keys as trimmed, length-capped strings. */
export function parseAttribution(raw: string | undefined): Attribution {
	if (!raw) return {};
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return {};
	}
	if (typeof data !== 'object' || data === null) return {};
	const result: Attribution = {};
	for (const key of Object.values(ATTRIBUTION_PARAMS)) {
		const value: unknown = (data as Record<string, unknown>)[key];
		if (typeof value === 'string' && value.trim()) {
			result[key] = value.trim().slice(0, ATTRIBUTION_MAX_LENGTH[key]);
		}
	}
	return result;
}

/** Browser only: remembers the landing page's campaign for 30 days (last campaign wins). */
export function captureAttribution(url: URL) {
	const found = attributionFromUrl(url);
	if (!found) return;
	document.cookie = `${ATTRIBUTION_COOKIE}=${encodeURIComponent(JSON.stringify(found))}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}
