import { describe, expect, it } from 'vite-plus/test';
import { categories, occasions } from './config';

describe('occasions', () => {
	it('link only to categories that exist', () => {
		const slugs = categories.map((category) => category.slug);
		for (const occasion of occasions) expect(slugs).toContain(occasion.category);
	});
});
