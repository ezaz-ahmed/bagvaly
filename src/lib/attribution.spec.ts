import { describe, expect, it } from 'vite-plus/test';
import { attributionFromUrl, parseAttribution } from './attribution';

describe('attributionFromUrl', () => {
	it('maps UTM params and fbclid', () => {
		const url = new URL('https://x.test/?utm_source=fb&utm_campaign=eid&fbclid=abc&other=1');
		expect(attributionFromUrl(url)).toEqual({ utmSource: 'fb', utmCampaign: 'eid', fbclid: 'abc' });
	});

	it('returns null without attribution and caps long values', () => {
		expect(attributionFromUrl(new URL('https://x.test/?ref=x'))).toBeNull();
		const long = attributionFromUrl(new URL(`https://x.test/?utm_term=${'a'.repeat(300)}`));
		expect(long?.utmTerm).toHaveLength(200);
	});
});

describe('parseAttribution', () => {
	it('keeps known string keys only', () => {
		expect(parseAttribution('{"utmSource":" ig ","price":1,"utmMedium":5}')).toEqual({
			utmSource: 'ig'
		});
	});

	it('ignores malformed values', () => {
		expect(parseAttribution(undefined)).toEqual({});
		expect(parseAttribution('nope')).toEqual({});
		expect(parseAttribution('null')).toEqual({});
	});
});
