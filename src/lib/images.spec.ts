import { describe, expect, it } from 'vite-plus/test';
import { imageSrcset, imageUrl, type ImageWidth } from './images';

const key = 'products/p1/abc.jpg';

describe('imageUrl', () => {
	it.each([400, 800, 1200] as const)('builds a transformation URL at width %d', (width) => {
		expect(imageUrl(key, width, true)).toBe(
			`/cdn-cgi/image/width=${width},quality=75,format=auto/products/p1/abc.jpg`
		);
	});

	it('returns the original URL when transformations are off', () => {
		expect(imageUrl(key, 800, false)).toBe('/products/p1/abc.jpg');
	});

	it('encodes each key segment', () => {
		expect(imageUrl('products/p 1/a?b#c.jpg', 400, true)).toBe(
			'/cdn-cgi/image/width=400,quality=75,format=auto/products/p%201/a%3Fb%23c.jpg'
		);
	});

	it.each([0, 320, 600, 1000, 2000])('throws for unapproved width %d', (width) => {
		expect(() => imageUrl(key, width as ImageWidth, true)).toThrow(RangeError);
		expect(() => imageUrl(key, width as ImageWidth, false)).toThrow(RangeError);
	});

	it.each(['', '/products/a.jpg', 'products//a.jpg', 'products/../secret', './a.jpg'])(
		'throws for unsafe key %j',
		(badKey) => {
			expect(() => imageUrl(badKey, 400, true)).toThrow();
		}
	);
});

describe('imageSrcset', () => {
	it('lists every approved width', () => {
		expect(imageSrcset(key, true)).toBe(
			[400, 800, 1200]
				.map((w) => `/cdn-cgi/image/width=${w},quality=75,format=auto/products/p1/abc.jpg ${w}w`)
				.join(', ')
		);
	});

	it('uses the original URL when transformations are off', () => {
		expect(imageSrcset(key, false)).toBe(
			'/products/p1/abc.jpg 400w, /products/p1/abc.jpg 800w, /products/p1/abc.jpg 1200w'
		);
	});
});
