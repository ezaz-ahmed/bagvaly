import { describe, expect, it } from 'vite-plus/test';
import { localized } from './localized';

describe('localized', () => {
	it('uses Bangla for bn when it has content', () => {
		expect(localized('Tote', 'টোট', 'bn')).toBe('টোট');
	});

	it.each([[''], ['   '], [null], [undefined]])('falls back to English when Bangla is %j', (bn) => {
		expect(localized('Tote', bn, 'bn')).toBe('Tote');
	});

	it('uses English for en even when Bangla exists', () => {
		expect(localized('Tote', 'টোট', 'en')).toBe('Tote');
	});
});
