import { env } from 'cloudflare:workers';
import { error, fail } from '@sveltejs/kit';
import * as v from 'valibot';
import { ORIGIN } from '$app/env/private';
import { imageUrl } from '#lib/images.ts';
import { m } from '#lib/paraglide/messages.js';
import { getLocale, localizeUrl } from '#lib/paraglide/runtime.js';
import { readCart, setLine, writeCart } from '#lib/server/cart.ts';
import { getCartItems, getProductBySlug, listRelated } from '#lib/server/catalog/queries.ts';
import { getDb } from '#lib/server/db/index.ts';
import { checkoutItemSchema, MAX_QTY_PER_LINE } from '#lib/server/orders/schemas.ts';
import type { Actions, PageServerLoad } from './$types';

// Public and the same for every visitor: hooks.server.ts caches it at the edge per URL.
export const load: PageServerLoad = async ({ params }) => {
	const locale = getLocale();
	const db = getDb(env.DB);
	const product = await getProductBySlug(db, params.slug, locale);
	if (!product) error(404, m.error_not_found_title());

	const related = await listRelated(db, product, locale);
	const cover = product.images[0];
	return {
		product,
		related: related.map(({ cover, ...item }) => ({ ...item, image: cover })),
		maxQuantity: MAX_QTY_PER_LINE,
		canonical: localizeUrl(new URL(`/bags/${encodeURIComponent(product.slug)}`, ORIGIN), {
			locale
		}).href,
		ogImage: cover ? new URL(imageUrl(cover.key, 1200), ORIGIN).href : null
	};
};

const addSchema = v.object({
	variantId: v.pipe(v.string(), v.toNumber(), v.integer()),
	quantity: v.pipe(v.string(), v.toNumber(), v.integer())
});

export const actions: Actions = {
	/** Adds a colour to the cart cookie. Stock is checked here; checkout checks it again. */
	add: async ({ request, cookies }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = v.safeParse(addSchema, form);
		const line = parsed.success ? v.safeParse(checkoutItemSchema, parsed.output) : null;
		if (!line?.success) return fail(400, { error: 'invalid' as const });

		const { variantId, quantity } = line.output;
		const item = (await getCartItems(getDb(env.DB), [variantId], getLocale())).get(variantId);
		if (!item) return fail(404, { error: 'invalid' as const });

		const lines = readCart(cookies);
		const inCart = lines.find((l) => l.variantId === variantId)?.quantity ?? 0;
		const wanted = Math.min(inCart + quantity, MAX_QTY_PER_LINE);
		if (item.stock === 0) return fail(409, { error: 'sold_out' as const });
		if (wanted > item.stock || inCart + quantity > MAX_QTY_PER_LINE) {
			return fail(409, { error: 'limit' as const });
		}

		writeCart(cookies, setLine(lines, variantId, wanted));
		return { added: true, colour: item.colourName };
	}
};
