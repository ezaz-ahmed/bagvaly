import * as v from 'valibot';
import { describe, expect, it } from 'vite-plus/test';
import { checkoutInputSchema, MAX_QTY_PER_LINE } from './schemas';

const valid = {
	name: ' Ayesha Rahman ',
	phone: '01712345678',
	districtId: 'dhaka',
	address: 'House 1, Road 2',
	items: [{ variantId: 1, quantity: 1 }],
	idempotencyKey: 'abcdefghijklmnop'
};

const parse = (overrides: Record<string, unknown>) =>
	v.safeParse(checkoutInputSchema, { ...valid, ...overrides });

describe('checkoutInputSchema', () => {
	it('accepts a minimal checkout and normalizes it', () => {
		const result = v.parse(checkoutInputSchema, valid);
		expect(result).toMatchObject({
			name: 'Ayesha Rahman',
			phone: '+8801712345678',
			areaLandmark: '',
			note: '',
			utmSource: null,
			fbclid: null
		});
	});

	it.each([
		['০১৭১২৩৪৫৬৭৮', '+8801712345678'],
		['+880 1712-345678', '+8801712345678'],
		[' 017 1234 5678 ', '+8801712345678'],
		['+৮৮০১৯১২৩৪৫৬৭৮', '+8801912345678']
	])('normalizes phone %j', (phone, expected) => {
		expect(v.parse(checkoutInputSchema, { ...valid, phone }).phone).toBe(expected);
	});

	it('drops prices and other unknown fields', () => {
		const result = v.parse(checkoutInputSchema, {
			...valid,
			total: 1,
			deliveryFee: 0,
			items: [{ variantId: 1, quantity: 1, price: 1, unitPrice: 1 }]
		});
		expect(result).not.toHaveProperty('total');
		expect(result.items[0]).toStrictEqual({ variantId: 1, quantity: 1 });
	});

	it('keeps attribution and turns empty values into null', () => {
		const result = v.parse(checkoutInputSchema, { ...valid, utmSource: ' fb ', utmMedium: '' });
		expect(result.utmSource).toBe('fb');
		expect(result.utmMedium).toBeNull();
	});

	it(`allows up to ${MAX_QTY_PER_LINE} per line`, () => {
		expect(parse({ items: [{ variantId: 1, quantity: MAX_QTY_PER_LINE }] }).success).toBe(true);
	});

	it.each([
		['a bad phone', { phone: '01212345678' }],
		['an unknown district', { districtId: 'atlantis' }],
		['an empty name', { name: '  ' }],
		['an empty address', { address: '' }],
		['no items', { items: [] }],
		['quantity 0', { items: [{ variantId: 1, quantity: 0 }] }],
		['quantity over the limit', { items: [{ variantId: 1, quantity: MAX_QTY_PER_LINE + 1 }] }],
		['a fractional quantity', { items: [{ variantId: 1, quantity: 1.5 }] }],
		[
			'the same colour twice',
			{
				items: [
					{ variantId: 1, quantity: 1 },
					{ variantId: 1, quantity: 1 }
				]
			}
		],
		['a short idempotency key', { idempotencyKey: 'abc' }],
		['an overlong utm value', { utmCampaign: 'x'.repeat(201) }]
	])('rejects %s', (_, overrides) => {
		expect(parse(overrides).success).toBe(false);
	});
});
