import { env } from 'cloudflare:workers';
import { fail, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { ATTRIBUTION_COOKIE, parseAttribution } from '#lib/attribution.ts';
import { DISTRICTS } from '#lib/districts.ts';
import { localized } from '#lib/localized.ts';
import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
import { loadCart, readCart, writeCart } from '#lib/server/cart.ts';
import { getDb } from '#lib/server/db/index.ts';
import { createOrder } from '#lib/server/orders/create.ts';
import { ORDER_ACCESS_COOKIE } from '#lib/server/orders/queries.ts';
import { checkoutInputSchema } from '#lib/server/orders/schemas.ts';
import type { Actions, PageServerLoad } from './$types';

const FIELDS = ['name', 'phone', 'districtId', 'address', 'areaLandmark', 'note'] as const;
type Field = (typeof FIELDS)[number];

// Personal page: never in the edge cache (not listed in hooks.server.ts).
export const load: PageServerLoad = async ({ cookies }) => {
	const locale = getLocale();
	const cart = await loadCart(getDb(env.DB), cookies, locale);
	if (cart.lines.length === 0 || cart.hasProblem) redirect(303, localizeHref('/cart'));

	const districts = DISTRICTS.map((d) => ({ value: d.id, label: localized(d.en, d.bn, locale) }))
		// Most orders are from Dhaka, so it is first; the rest alphabetical.
		.sort(
			(a, b) =>
				Number(b.value === 'dhaka') - Number(a.value === 'dhaka') ||
				a.label.localeCompare(b.label, locale)
		);

	return {
		cart,
		districts,
		// One key per checkout attempt: a double submit or retry returns the same order.
		idempotencyKey: crypto.randomUUID()
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const text = (key: string) => {
			const value = form.get(key);
			return typeof value === 'string' ? value : '';
		};
		const values = Object.fromEntries(FIELDS.map((key) => [key, text(key)])) as Record<
			Field,
			string
		>;

		const items = readCart(cookies);
		if (items.length === 0) redirect(303, localizeHref('/cart'));

		const parsed = v.safeParse(checkoutInputSchema, {
			...values,
			items,
			idempotencyKey: text('idempotencyKey'),
			...parseAttribution(cookies.get(ATTRIBUTION_COOKIE))
		});
		if (!parsed.success) {
			const nested = v.flatten<typeof checkoutInputSchema>(parsed.issues).nested ?? {};
			const errors = FIELDS.filter((key) => nested[key]);
			// Anything else (items, key) means the cart changed under us: back to the cart.
			if (errors.length === 0) return fail(409, { values, errors, formError: 'stock' as const });
			return fail(400, { values, errors, formError: null });
		}

		const result = await createOrder(getDb(env.DB), parsed.output);
		if (!result.ok) {
			return fail(result.code === 'customer_blocked' ? 403 : 409, {
				values,
				errors: [] as Field[],
				formError: result.code === 'customer_blocked' ? ('blocked' as const) : ('stock' as const)
			});
		}

		cookies.set(ORDER_ACCESS_COOKIE, parsed.output.idempotencyKey, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});
		writeCart(cookies, []);
		redirect(303, localizeHref(`/order/${result.number}`));
	}
};
