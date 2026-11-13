import { describe, expect, it } from 'vite-plus/test';
import { DISTRICTS, DIVISIONS } from './districts';

describe('DISTRICTS', () => {
	it('lists all 64 districts with unique slug ids', () => {
		expect(DISTRICTS).toHaveLength(64);
		const ids = DISTRICTS.map((district) => district.id);
		expect(new Set(ids).size).toBe(64);
		for (const id of ids) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
	});

	it('matches the official district count per division', () => {
		const counts = Object.fromEntries(
			DIVISIONS.map((division) => [
				division,
				DISTRICTS.filter((d) => d.division === division).length
			])
		);
		expect(counts).toEqual({
			barishal: 6,
			chattogram: 11,
			dhaka: 13,
			khulna: 10,
			mymensingh: 4,
			rajshahi: 8,
			rangpur: 8,
			sylhet: 4
		});
	});

	it('has an English and an NFC-normalized Bangla name for every district', () => {
		for (const district of DISTRICTS) {
			expect(district.en).not.toBe('');
			expect(district.bn).toMatch(/^[ঀ-৿]+$/);
			expect(district.bn).toBe(district.bn.normalize('NFC'));
		}
	});
});
