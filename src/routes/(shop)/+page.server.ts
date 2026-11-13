import { env } from 'cloudflare:workers';
import { ORIGIN } from '$app/env/private';
import { getLocale, localizeUrl } from '#lib/paraglide/runtime.js';
import { listHomeProducts } from '#lib/server/catalog/queries.ts';
import { getDb } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

// Public and the same for every visitor: hooks.server.ts caches it at the edge per URL.
export const load: PageServerLoad = async () => {
	const locale = getLocale();
	const items = await listHomeProducts(getDb(env.DB), locale);
	return {
		products: items.map(({ cover, ...item }) => ({ ...item, image: cover })),
		canonical: localizeUrl(new URL('/', ORIGIN), { locale }).href
	};
};
