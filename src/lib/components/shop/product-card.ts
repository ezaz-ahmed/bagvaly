import { discountPercent } from '#lib/money.ts';

/** What a product card needs; catalogue queries (#62) map rows to this. Browser-safe. */
export interface ProductCardData {
	slug: string;
	/** Already localized (see `localized()`). */
	name: string;
	/** Poisha. */
	price: number;
	compareAtPrice: number | null;
	isNew: boolean;
	isBestSeller: boolean;
	/** True when any variant has stock; cached pages show no counts (AGENTS.md section 11). */
	inStock: boolean;
	colourCount: number;
	/** Cover photo (position 0), or null when the product has no photos yet. */
	image: { key: string; alt: string; width: number; height: number } | null;
}

export type CardBadge = 'sold-out' | 'sale' | 'new' | 'best-seller';

/** The one badge a card shows: SOLD OUT > SALE > NEW > BEST SELLER. */
export function cardBadge(product: ProductCardData): CardBadge | null {
	if (!product.inStock) return 'sold-out';
	// Same rule as Price, so a SALE badge always comes with a visible % off.
	if (discountPercent(product.price, product.compareAtPrice) !== null) return 'sale';
	if (product.isNew) return 'new';
	if (product.isBestSeller) return 'best-seller';
	return null;
}
