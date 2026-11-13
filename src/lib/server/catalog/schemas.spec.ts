import * as v from 'valibot';
import { describe, expect, it } from 'vite-plus/test';
import { productInputSchema } from './schemas';

const valid = {
	slug: 'quilted-chain-shoulder-bag',
	nameEn: ' Quilted chain shoulder bag ',
	categoryId: 1,
	price: 145_000,
	status: 'published',
	skuPrefix: 'bv-qcs',
	youtubeVideoId: '',
	variants: [
		{ colourNameEn: 'Burgundy', colourHex: '#790B27', sku: 'BV-QCS-BUR', stock: 2 },
		{ colourNameEn: 'Black', colourHex: '#292525', sku: 'BV-QCS-BLK', stock: 0 }
	]
};

const parse = (overrides: Record<string, unknown>) =>
	v.safeParse(productInputSchema, { ...valid, ...overrides });

describe('productInputSchema', () => {
	it('accepts a valid product and normalizes it', () => {
		const result = v.parse(productInputSchema, valid);
		expect(result.nameEn).toBe('Quilted chain shoulder bag');
		expect(result.nameBn).toBe('');
		expect(result.compareAtPrice).toBeNull();
		expect(result.youtubeVideoId).toBeNull();
		expect(result.skuPrefix).toBe('BV-QCS');
		expect(result.variants[0].colourHex).toBe('#790b27');
		expect(result.isNew).toBe(false);
	});

	it.each([
		['a YouTube ID', { youtubeVideoId: 'dQw4w9WgXcQ' }],
		['a sale price', { compareAtPrice: 155_000 }],
		['a hidden product', { status: 'hidden' }],
		['a free product', { price: 0 }]
	])('accepts %s', (_, overrides) => {
		expect(parse(overrides).success).toBe(true);
	});

	it.each([
		['a negative price', { price: -1 }],
		['a fractional price', { price: 1450.5 }],
		['compare-at equal to price', { compareAtPrice: 145_000 }],
		['compare-at below price', { compareAtPrice: 100_000 }],
		['an unknown status', { status: 'archived' }],
		['a YouTube URL', { youtubeVideoId: 'https://youtu.be/dQw4w9WgXcQ' }],
		['a short YouTube ID', { youtubeVideoId: 'abc' }],
		['a bad slug', { slug: 'Quilted Bag' }],
		['an empty English name', { nameEn: '   ' }],
		['no colours', { variants: [] }],
		[
			'a bad hex',
			{ variants: [{ colourNameEn: 'Red', colourHex: '#79b27', sku: 'BV-R', stock: 1 }] }
		],
		[
			'negative stock',
			{ variants: [{ colourNameEn: 'Red', colourHex: '#790b27', sku: 'BV-R', stock: -1 }] }
		],
		[
			'duplicate SKUs',
			{
				variants: [
					{ colourNameEn: 'Red', colourHex: '#790b27', sku: 'BV-R', stock: 1 },
					{ colourNameEn: 'Rose', colourHex: '#790b28', sku: 'bv-r', stock: 1 }
				]
			}
		]
	])('rejects %s', (_, overrides) => {
		expect(parse(overrides).success).toBe(false);
	});
});
