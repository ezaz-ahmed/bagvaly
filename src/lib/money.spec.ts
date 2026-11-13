import { describe, expect, it } from 'vite-plus/test';
import { discountPercent, formatPrice, toPoisha } from './money';

describe('toPoisha', () => {
	it.each([
		[0, 0],
		[1450, 145_000],
		[19.99, 1999],
		[0.1, 10],
		[1.1, 110],
		[999_999.99, 99_999_999]
	])('converts ৳%d to %d poisha', (taka, poisha) => {
		expect(toPoisha(taka)).toBe(poisha);
	});

	it.each([Number.NaN, Infinity, -Infinity, -1, -0.01, 1.005, 0.001, Number.MAX_SAFE_INTEGER])(
		'rejects %d',
		(taka) => {
			expect(() => toPoisha(taka)).toThrow(RangeError);
		}
	);
});

describe('formatPrice', () => {
	it.each([
		[0, '৳ 0'],
		[145_000, '৳ 1,450'],
		[1999, '৳ 19.99'],
		[1950, '৳ 19.50'],
		[5, '৳ 0.05'],
		[123_456_700, '৳ 1,234,567'],
		[-5000, '-৳ 50']
	])('formats %d poisha in English as %s', (poisha, expected) => {
		expect(formatPrice(poisha)).toBe(expected);
		expect(formatPrice(poisha, 'en')).toBe(expected);
	});

	it.each([
		[0, '৳ ০'],
		[145_000, '৳ ১,৪৫০'],
		[1999, '৳ ১৯.৯৯'],
		// bn-BD uses lakh grouping.
		[123_456_700, '৳ ১২,৩৪,৫৬৭']
	])('formats %d poisha in Bangla as %s', (poisha, expected) => {
		expect(formatPrice(poisha, 'bn')).toBe(expected);
	});

	it.each([1.5, Number.NaN, Infinity])('rejects non-integer poisha %d', (poisha) => {
		expect(() => formatPrice(poisha)).toThrow(RangeError);
	});
});

describe('discountPercent', () => {
	it.each([
		[145_000, 200_000, 28],
		[50_000, 100_000, 50],
		[66_700, 100_000, 33],
		[66_500, 100_000, 34],
		[0, 100_000, 100]
	])('price %d vs compare-at %d is %d%%', (price, compareAt, percent) => {
		expect(discountPercent(price, compareAt)).toBe(percent);
	});

	it.each([
		[100_000, null],
		[100_000, undefined],
		[100_000, 100_000],
		[100_000, 90_000],
		[100_000, 100_100],
		[-100, 100_000]
	])('price %d vs compare-at %j has no discount', (price, compareAt) => {
		expect(discountPercent(price, compareAt)).toBeNull();
	});
});
