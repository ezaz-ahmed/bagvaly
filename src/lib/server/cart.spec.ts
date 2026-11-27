import { describe, expect, it } from 'vite-plus/test';
import { MAX_CART_LINES, parseCart, setLine } from './cart';

describe('parseCart', () => {
	it('returns [] for missing, malformed or non-array values', () => {
		expect(parseCart(undefined)).toEqual([]);
		expect(parseCart('not json')).toEqual([]);
		expect(parseCart('{"variantId":1}')).toEqual([]);
	});

	it('drops invalid lines and merges duplicates up to the per-line cap', () => {
		const raw = JSON.stringify([
			{ variantId: 1, quantity: 2 },
			{ variantId: 1, quantity: 4 },
			{ variantId: 2, quantity: 0 },
			{ variantId: -3, quantity: 1 },
			{ variantId: 4, quantity: 1.5 },
			{ variantId: 5, quantity: 1, price: 1 }
		]);
		expect(parseCart(raw)).toEqual([
			{ variantId: 1, quantity: 5 },
			{ variantId: 5, quantity: 1 }
		]);
	});

	it('caps the number of lines', () => {
		const raw = JSON.stringify(
			Array.from({ length: MAX_CART_LINES + 5 }, (_, i) => ({ variantId: i + 1, quantity: 1 }))
		);
		expect(parseCart(raw)).toHaveLength(MAX_CART_LINES);
	});
});

describe('setLine', () => {
	const lines = [
		{ variantId: 1, quantity: 1 },
		{ variantId: 2, quantity: 2 }
	];

	it('adds a new line first', () => {
		expect(setLine(lines, 3, 1)[0]).toEqual({ variantId: 3, quantity: 1 });
	});

	it('updates in place and caps the quantity', () => {
		expect(setLine(lines, 2, 9)).toEqual([
			{ variantId: 1, quantity: 1 },
			{ variantId: 2, quantity: 5 }
		]);
	});

	it('removes a line at 0', () => {
		expect(setLine(lines, 1, 0)).toEqual([{ variantId: 2, quantity: 2 }]);
	});
});
