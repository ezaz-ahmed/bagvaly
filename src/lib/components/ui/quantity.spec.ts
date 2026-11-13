import { describe, expect, it } from 'vite-plus/test';
import { clampQuantity, stepQuantity } from './quantity';

describe('clampQuantity', () => {
	it.each([
		[5, 1, 10, 5],
		[0, 1, 10, 1],
		[12, 1, 10, 10],
		[3, 1, 0, 1]
	])('clamps %d into [%d, %d] as %d', (value, min, max, expected) => {
		expect(clampQuantity(value, min, max)).toBe(expected);
	});
});

describe('stepQuantity', () => {
	it('steps within bounds', () => {
		expect(stepQuantity(2, 1, 1, 10)).toBe(3);
		expect(stepQuantity(2, -1, 1, 10)).toBe(1);
	});

	it('stops at min and max', () => {
		expect(stepQuantity(1, -1, 1, 10)).toBe(1);
		expect(stepQuantity(10, 1, 1, 10)).toBe(10);
	});

	it('pulls an out-of-range value back in (stock dropped below the cart quantity)', () => {
		expect(stepQuantity(8, 1, 1, 3)).toBe(3);
		expect(stepQuantity(8, -1, 1, 3)).toBe(3);
	});
});
