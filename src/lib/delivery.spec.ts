import { describe, expect, it } from 'vite-plus/test';
import { DELIVERY_ZONES, zoneForDistrict } from './delivery';
import { DISTRICTS } from './districts';

describe('DELIVERY_ZONES', () => {
	it('holds the owner-confirmed fees and ETAs', () => {
		expect(DELIVERY_ZONES).toEqual({
			inside_dhaka: { fee: 7000, etaDays: { min: 2, max: 3 } },
			outside_dhaka: { fee: 13_000, etaDays: { min: 3, max: 5 } }
		});
	});
});

describe('zoneForDistrict', () => {
	it('puts only Dhaka district inside Dhaka', () => {
		expect(zoneForDistrict('dhaka')).toBe('inside_dhaka');
		const inside = DISTRICTS.filter((district) => zoneForDistrict(district.id) === 'inside_dhaka');
		expect(inside.map((district) => district.id)).toEqual(['dhaka']);
	});

	it('gives every district a zone', () => {
		for (const district of DISTRICTS) expect(zoneForDistrict(district.id)).not.toBeNull();
		expect(zoneForDistrict('gazipur')).toBe('outside_dhaka');
	});

	it.each(['', 'Dhaka', 'atlantis'])('returns null for unknown id %j', (id) => {
		expect(zoneForDistrict(id)).toBeNull();
	});
});
