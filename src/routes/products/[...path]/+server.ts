import { env } from 'cloudflare:workers';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Original product photos from R2 at `/products/...` (the object key), the origin that
 * `/cdn-cgi/image/...` URLs from `imageUrl()` resize. Keys are unique and never overwritten
 * (AGENTS.md section 10), so browsers and the edge may keep a copy for a year.
 */
export const GET: RequestHandler = async ({ params }) => {
	const object = await env.R2.get(`products/${params.path}`);
	if (!object) error(404);

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('etag', object.httpEtag);
	headers.set('cache-control', 'public, max-age=31536000, immutable');
	return new Response(object.body, { headers });
};
