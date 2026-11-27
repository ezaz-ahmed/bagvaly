import { env } from 'cloudflare:workers';
import { fail } from '@sveltejs/kit';
import * as v from 'valibot';
import { getLocale } from '#lib/paraglide/runtime.js';
import { loadCart, readCart, setLine, writeCart } from '#lib/server/cart.ts';
import { getCartItems } from '#lib/server/catalog/queries.ts';
import { getDb } from '#lib/server/db/index.ts';
import { MAX_QTY_PER_LINE } from '#lib/server/orders/schemas.ts';
import type { Actions, PageServerLoad } from './$types';

// Personal page: never in the edge cache (not listed in hooks.server.ts).
export const load: PageServerLoad = async ({ cookies }) => ({
	cart: await loadCart(getDb(env.DB), cookies, getLocale())
});

const lineSchema = v.object({
	variantId: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1)),
	quantity: v.optional(
		v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(0), v.maxValue(MAX_QTY_PER_LINE)),
		'0'
	)
});

export const actions: Actions = {
	/** Sets a line's quantity, capped by live stock; 0 removes it. */
	update: async ({ request, cookies }) => {
		const parsed = v.safeParse(lineSchema, Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400);
		const { variantId, quantity } = parsed.output;
		const lines = readCart(cookies);
		if (!lines.some((line) => line.variantId === variantId)) return fail(404);

		const item = (await getCartItems(getDb(env.DB), [variantId], getLocale())).get(variantId);
		writeCart(cookies, setLine(lines, variantId, Math.min(quantity, item?.stock ?? 0)));
	},

	remove: async ({ request, cookies }) => {
		const parsed = v.safeParse(lineSchema, Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400);
		writeCart(cookies, setLine(readCart(cookies), parsed.output.variantId, 0));
	}
};
