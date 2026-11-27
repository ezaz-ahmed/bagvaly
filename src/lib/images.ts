import { dev } from '$app/env';

/** The only approved Image Transformations widths (AGENTS.md section 10). */
export const IMAGE_WIDTHS = [400, 800, 1200] as const;
export type ImageWidth = (typeof IMAGE_WIDTHS)[number];

/**
 * Same-origin path of the original R2 object, per docs/ARCHITECTURE.md 6.3. Served by
 * `src/routes/products/[...path]/+server.ts`, so keys must start with `products/`.
 */
function originalUrl(key: string): string {
	const segments = key.split('/');
	if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
		throw new Error(`Invalid image key: ${key}`);
	}
	return `/${segments.map(encodeURIComponent).join('/')}`;
}

/**
 * Cloudflare Image Transformations URL for an R2 key at an approved width.
 * With `transform` off (default in dev, where `/cdn-cgi/image` does not exist) returns the original URL.
 */
export function imageUrl(key: string, width: ImageWidth, transform: boolean = !dev): string {
	if (!IMAGE_WIDTHS.includes(width)) throw new RangeError(`Unapproved image width: ${width}`);
	const original = originalUrl(key);
	return transform ? `/cdn-cgi/image/width=${width},quality=75,format=auto${original}` : original;
}

/** `srcset` value covering every approved width. */
export function imageSrcset(key: string, transform: boolean = !dev): string {
	return IMAGE_WIDTHS.map((width) => `${imageUrl(key, width, transform)} ${width}w`).join(', ');
}
