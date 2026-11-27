import { readCartCount } from './cart-count';

/** Header cart badge. Client-only: cached HTML never carries a visitor's cart. */
export const cartBadge = $state({ count: 0 });

/** Re-reads the count from the cookie; call after anything that changes the cart. */
export function refreshCartBadge() {
	cartBadge.count = readCartCount(document.cookie);
}
