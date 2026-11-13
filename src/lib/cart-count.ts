export const CART_COOKIE = 'bv_cart';

/**
 * Number of items in the visitor's cart, read from `document.cookie` on the client only (pages
 * are cached, so the count must never be in server HTML). The `bv_cart` cookie holds a
 * URL-encoded JSON array of lines with a `quantity`; anything missing or malformed counts as 0.
 */
export function readCartCount(cookieHeader: string): number {
	const raw = cookieHeader
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${CART_COOKIE}=`))
		?.slice(CART_COOKIE.length + 1);
	if (!raw) return 0;

	let lines: unknown;
	try {
		lines = JSON.parse(decodeURIComponent(raw));
	} catch {
		return 0;
	}
	if (!Array.isArray(lines)) return 0;

	let count = 0;
	for (const line of lines) {
		const quantity: unknown = line?.quantity;
		if (Number.isSafeInteger(quantity) && (quantity as number) > 0) count += quantity as number;
	}
	return count;
}
