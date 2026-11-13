import { describe, expect, it } from 'vite-plus/test';
import { readCartCount } from './cart-count';

const cookie = (lines: unknown) => `bv_cart=${encodeURIComponent(JSON.stringify(lines))}`;

describe('readCartCount', () => {
	it('sums line quantities', () => {
		expect(readCartCount(`a=1; ${cookie([{ quantity: 2 }, { quantity: 1 }])}; b=2`)).toBe(3);
	});

	it('is 0 without the cookie', () => {
		expect(readCartCount('')).toBe(0);
		expect(readCartCount('other=1; bv_cart_old=5')).toBe(0);
	});

	it('is 0 for malformed values', () => {
		expect(readCartCount('bv_cart=%E0%A4')).toBe(0);
		expect(readCartCount('bv_cart={not json')).toBe(0);
		expect(readCartCount(cookie({ quantity: 2 }))).toBe(0);
	});

	it('ignores lines without a positive whole quantity', () => {
		expect(
			readCartCount(
				cookie([null, 'x', { quantity: -1 }, { quantity: 1.5 }, { quantity: '2' }, { quantity: 4 }])
			)
		).toBe(4);
	});
});
