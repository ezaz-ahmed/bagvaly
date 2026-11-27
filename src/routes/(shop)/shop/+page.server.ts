import { env } from 'cloudflare:workers';
import { error } from '@sveltejs/kit';
import { ORIGIN } from '$app/env/private';
import { m } from '#lib/paraglide/messages.js';
import { getLocale, localizeUrl } from '#lib/paraglide/runtime.js';
import {
	listCategories,
	listProducts,
	PRODUCT_SORTS,
	type ProductSort
} from '#lib/server/catalog/queries.ts';
import { getDb } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

const isSort = (value: string | null): value is ProductSort =>
	PRODUCT_SORTS.includes(value as ProductSort);

// Public and the same for every visitor: hooks.server.ts caches it at the edge per URL.
export const load: PageServerLoad = async ({ url }) => {
	const locale = getLocale();
	const db = getDb(env.DB);
	const slug = url.searchParams.get('category');
	const sortParam = url.searchParams.get('sort');
	const sort = isSort(sortParam) ? sortParam : 'newest';
	const cursor = url.searchParams.get('cursor');

	const [categories, page] = await Promise.all([
		listCategories(db, locale),
		listProducts(db, { locale, category: slug, sort, cursor })
	]);
	const category = slug ? categories.find((c) => c.slug === slug) : undefined;
	if (slug && !category) error(404, m.error_not_found_title());

	// Sorted and later pages point search engines at the plain category page.
	const base = category ? `/shop?category=${encodeURIComponent(category.slug)}` : '/shop';
	return {
		categories,
		category: category ?? null,
		sort,
		cursor,
		products: page.items.map(({ cover, ...item }) => ({ ...item, image: cover })),
		nextCursor: page.nextCursor,
		canonical: localizeUrl(new URL(base, ORIGIN), { locale }).href
	};
};
