import { describe, expect, it } from 'vite-plus/test';
import { cardBadge, type ProductCardData } from './product-card';

const base: ProductCardData = {
	slug: 'tote',
	name: 'Tote',
	price: 145_000,
	compareAtPrice: null,
	isNew: false,
	isBestSeller: false,
	inStock: true,
	colourCount: 1,
	image: null
};

describe('cardBadge', () => {
	it('shows no badge for a plain product', () => {
		expect(cardBadge(base)).toBeNull();
	});

	it('puts sold out above everything, even a sale', () => {
		expect(
			cardBadge({
				...base,
				inStock: false,
				compareAtPrice: 180_000,
				isNew: true,
				isBestSeller: true
			})
		).toBe('sold-out');
	});

	it('puts sale above new and best seller', () => {
		expect(cardBadge({ ...base, compareAtPrice: 180_000, isNew: true, isBestSeller: true })).toBe(
			'sale'
		);
	});

	it('is not a sale without a real discount', () => {
		expect(cardBadge({ ...base, compareAtPrice: 145_000 })).toBeNull();
		expect(cardBadge({ ...base, compareAtPrice: 145_100 })).toBeNull(); // rounds to 0%
	});

	it('puts new above best seller', () => {
		expect(cardBadge({ ...base, isNew: true, isBestSeller: true })).toBe('new');
		expect(cardBadge({ ...base, isBestSeller: true })).toBe('best-seller');
	});
});
