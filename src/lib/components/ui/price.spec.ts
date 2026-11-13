import { describe, expect, it } from 'vite-plus/test';
import { priceParts } from './price';

describe('priceParts', () => {
	it('shows only the price without a compare-at price', () => {
		expect(priceParts(145_000, null, 'en')).toEqual({ now: '৳ 1,450', was: null, percent: null });
	});

	it('shows the compare-at price and percent off for a real discount', () => {
		expect(priceParts(145_000, 180_000, 'en')).toEqual({
			now: '৳ 1,450',
			was: '৳ 1,800',
			percent: '19'
		});
	});

	it.each([
		['equal', 145_000],
		['lower', 100_000],
		['rounds to 0%', 145_100]
	])('hides the compare-at price when it is %s', (_, compareAt) => {
		expect(priceParts(145_000, compareAt, 'en')).toMatchObject({ was: null, percent: null });
	});

	it('uses Bangla digits for bn', () => {
		expect(priceParts(145_000, 180_000, 'bn')).toEqual({
			now: '৳ ১,৪৫০',
			was: '৳ ১,৮০০',
			percent: '১৯'
		});
	});
});
