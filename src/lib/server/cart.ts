import * as v from 'valibot';
import type { Cookies } from '@sveltejs/kit';
import { CART_COOKIE } from '#lib/cart-count.ts';
import { getCartItems } from '#lib/server/catalog/queries.ts';
import type { Db } from '#lib/server/db/index.ts';
import {
	checkoutItemSchema,
	MAX_ORDER_LINES,
	MAX_QTY_PER_LINE
} from '#lib/server/orders/schemas.ts';

// The cart lives in the `bv_cart` cookie as `[{ variantId, quantity }]`. It is readable by the
// browser (the header badge counts it), so it is untrusted: prices and stock always come from D1.

export type CartLine = v.InferOutput<typeof checkoutItemSchema>;

/** Same cap as checkout, so a cart can always be submitted. */
export const MAX_CART_LINES = MAX_ORDER_LINES;

const CART_MAX_AGE = 60 * 60 * 24 * 30;

/** Valid lines from a raw cookie value; bad lines are dropped and duplicates merged (capped). */
export function parseCart(raw: string | undefined): CartLine[] {
	if (!raw) return [];
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return [];
	}
	if (!Array.isArray(data)) return [];

	const merged = new Map<number, number>();
	for (const item of data) {
		const line = v.safeParse(checkoutItemSchema, item);
		if (!line.success) continue;
		const { variantId, quantity } = line.output;
		merged.set(variantId, Math.min((merged.get(variantId) ?? 0) + quantity, MAX_QTY_PER_LINE));
	}
	return [...merged]
		.slice(0, MAX_CART_LINES)
		.map(([variantId, quantity]) => ({ variantId, quantity }));
}

/** Sets `quantity` for a variant (0 removes it). New lines go first, like a fresh pick. */
export function setLine(lines: CartLine[], variantId: number, quantity: number): CartLine[] {
	const rest = lines.filter((line) => line.variantId !== variantId);
	if (quantity <= 0) return rest;
	const line = { variantId, quantity: Math.min(quantity, MAX_QTY_PER_LINE) };
	const index = lines.findIndex((l) => l.variantId === variantId);
	if (index === -1) return [line, ...rest].slice(0, MAX_CART_LINES);
	rest.splice(index, 0, line);
	return rest;
}

export const readCart = (cookies: Cookies) => parseCart(cookies.get(CART_COOKIE));

/**
 * The cart with live names, prices and stock, for the cart and checkout pages (never cached).
 * Lines whose colour no longer exists or is in a draft product are dropped from the cookie.
 */
export async function loadCart(db: Db, cookies: Cookies, locale: string) {
	const stored = readCart(cookies);
	const items = await getCartItems(
		db,
		stored.map((line) => line.variantId),
		locale
	);
	const lines = stored.flatMap(({ variantId, quantity }) => {
		const item = items.get(variantId);
		if (!item) return [];
		const { stock, ...rest } = item;
		return [
			{
				...rest,
				quantity,
				lineTotal: item.price * quantity,
				/** Highest quantity the stepper allows. */
				maxQuantity: Math.max(1, Math.min(stock, MAX_QTY_PER_LINE)),
				problem: stock === 0 ? ('sold_out' as const) : stock < quantity ? ('short' as const) : null
			}
		];
	});
	if (lines.length !== stored.length) writeCart(cookies, lines);
	return {
		lines,
		subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
		count: lines.reduce((sum, line) => sum + line.quantity, 0),
		hasProblem: lines.some((line) => line.problem !== null)
	};
}

export type CartView = Awaited<ReturnType<typeof loadCart>>;

export function writeCart(cookies: Cookies, lines: CartLine[]) {
	if (lines.length === 0) {
		cookies.delete(CART_COOKIE, { path: '/' });
		return;
	}
	// Not httpOnly: the header badge reads it on cached pages.
	cookies.set(CART_COOKIE, JSON.stringify(lines), {
		path: '/',
		httpOnly: false,
		sameSite: 'lax',
		maxAge: CART_MAX_AGE
	});
}
