import { describe, expect, it } from 'vite-plus/test';
import { isCanonicalBdPhone, normalizeBdPhone } from './phone';

describe('normalizeBdPhone', () => {
	it.each([
		['01712345678', '+8801712345678'],
		['8801712345678', '+8801712345678'],
		['+8801712345678', '+8801712345678'],
		[' 017-1234 5678 ', '+8801712345678'],
		['+880 1712-345678', '+8801712345678'],
		['০১৭১২৩৪৫৬৭৮', '+8801712345678'],
		['+৮৮০ ১৯১২-৩৪৫৬৭৮', '+8801912345678']
	])('normalizes %j to %s', (input, expected) => {
		expect(normalizeBdPhone(input)).toBe(expected);
	});

	it.each([
		'',
		'1712345678',
		'0171234567',
		'017123456789',
		'01212345678',
		'+8811712345678',
		'+880171234567a',
		'01712.345678'
	])('rejects %j', (input) => {
		expect(normalizeBdPhone(input)).toBeNull();
	});
});

describe('isCanonicalBdPhone', () => {
	it('accepts only the canonical form', () => {
		expect(isCanonicalBdPhone('+8801712345678')).toBe(true);
		expect(isCanonicalBdPhone('01712345678')).toBe(false);
		expect(isCanonicalBdPhone('+880 1712345678')).toBe(false);
	});
});
