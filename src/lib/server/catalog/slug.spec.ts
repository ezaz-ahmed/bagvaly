import { describe, expect, it } from 'vite-plus/test';
import { slugify } from './slug';

describe('slugify', () => {
	it.each([
		['Quilted chain shoulder bag', 'quilted-chain-shoulder-bag'],
		['  Top-handle  Bag!! ', 'top-handle-bag'],
		['Café crème clutch', 'cafe-creme-clutch'],
		['Mini zip crossbody (2026)', 'mini-zip-crossbody-2026'],
		['ব্যাগ Tote ব্যাগ', 'tote']
	])('%j → %j', (name, slug) => {
		expect(slugify(name)).toBe(slug);
	});

	it('caps the length at 80 without a trailing hyphen', () => {
		const slug = slugify('word '.repeat(40));
		expect(slug.length).toBeLessThanOrEqual(80);
		expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
	});

	it('gives Bangla-only names a stable, distinct fallback', () => {
		const a = slugify('কোয়িল্টেড ব্যাগ');
		expect(a).toMatch(/^bag-[a-z0-9]+$/);
		expect(slugify('কোয়িল্টেড ব্যাগ')).toBe(a);
		expect(slugify('টোট ব্যাগ')).not.toBe(a);
	});

	it('handles empty input deterministically', () => {
		expect(slugify('')).toBe(slugify('   '));
		expect(slugify('')).toMatch(/^bag-[a-z0-9]+$/);
	});
});
