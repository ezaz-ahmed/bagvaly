import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const pending: Promise<unknown>[] = [];
vi.mock('cloudflare:workers', () => ({ waitUntil: (p: Promise<unknown>) => pending.push(p) }));
vi.mock('$app/env', () => ({ dev: false, building: false }));
vi.mock('$app/env/private', () => ({ ORIGIN: 'https://bagvaly.test' }));

const { affectedUrls, cachedPublic, PUBLIC_CACHE_TTL_SECONDS } = await import('./cache');

/** In-memory stand-in for `caches.default`, keyed by URL like the Cache API. */
let store: Map<string, Response>;
beforeEach(() => {
	store = new Map();
	pending.length = 0;
	vi.stubGlobal('caches', {
		default: {
			match: async (key: string) => store.get(key)?.clone(),
			put: async (key: string, response: Response) => void store.set(key, response)
		}
	});
});
afterEach(() => vi.unstubAllGlobals());

const URL_ = 'https://bagvaly.test/bn/shop?category=tote';
const page = (init?: ResponseInit) => async () => new Response('<html>shop</html>', init);

async function run(request: Request, render: () => Promise<Response>) {
	const response = await cachedPublic(request, render);
	await Promise.all(pending);
	return response;
}

describe('cachedPublic', () => {
	it('stores a public 200 GET with an edge TTL and serves the next request from cache', async () => {
		const render = vi.fn(page({ headers: { 'content-type': 'text/html' } }));
		const first = await run(new Request(URL_), render);
		expect(first.headers.get('cache-control')).toBe(`public, s-maxage=${PUBLIC_CACHE_TTL_SECONDS}`);
		expect(await first.text()).toBe('<html>shop</html>');
		expect([...store.keys()]).toEqual([URL_]);

		// Analytics cookies are not a session: still cached.
		const hit = await run(new Request(URL_, { headers: { cookie: '_fbp=fb.1.2' } }), render);
		expect(await hit.text()).toBe('<html>shop</html>');
		expect(render).toHaveBeenCalledTimes(1);
	});

	it('keys by full URL, so locales and query strings are cached separately', async () => {
		await run(new Request('https://bagvaly.test/shop'), page());
		await run(new Request('https://bagvaly.test/bn/shop'), page());
		await run(new Request('https://bagvaly.test/shop?category=tote'), page());
		expect(store.size).toBe(3);
	});

	it.each([
		['better-auth.session_token=abc'],
		['_fbp=1; __Secure-better-auth.session_token=abc'],
		['better-auth.session_data=xyz']
	])('never reads or writes the cache for a session cookie (%s)', async (cookie) => {
		store.set(URL_, new Response('someone else'));
		const render = vi.fn(page());
		const response = await run(new Request(URL_, { headers: { cookie } }), render);
		expect(await response.text()).toBe('<html>shop</html>');
		expect(render).toHaveBeenCalledOnce();
		expect(await store.get(URL_)!.text()).toBe('someone else');
	});

	it('skips requests with Authorization and non-GET requests', async () => {
		await run(new Request(URL_, { headers: { authorization: 'Bearer x' } }), page());
		await run(new Request(URL_, { method: 'POST', body: 'a=1' }), page());
		await run(new Request(URL_, { method: 'HEAD' }), page());
		expect(store.size).toBe(0);
	});

	it.each([
		['Set-Cookie', { headers: { 'set-cookie': 'better-auth.session_token=new; HttpOnly' } }],
		['non-200', { status: 404 }],
		['redirect', { status: 303, headers: { location: '/' } }],
		['Cache-Control: private', { headers: { 'cache-control': 'private, max-age=0' } }],
		['Cache-Control: no-store', { headers: { 'cache-control': 'no-store' } }]
	])('never stores a response with %s', async (_, init: ResponseInit) => {
		const response = await run(new Request(URL_), page(init));
		expect(store.size).toBe(0);
		expect(response.status).toBe(init.status ?? 200);
	});
});

describe('affectedUrls', () => {
	it('lists home, shop, category and product pages in both locales', () => {
		expect(affectedUrls({ slug: 'tote-1', categorySlugs: ['tote', 'old'] }).sort()).toEqual(
			[
				'https://bagvaly.test/',
				'https://bagvaly.test/shop',
				'https://bagvaly.test/shop?category=tote',
				'https://bagvaly.test/shop?category=old',
				'https://bagvaly.test/bags/tote-1',
				'https://bagvaly.test/bn/',
				'https://bagvaly.test/bn',
				'https://bagvaly.test/bn/shop',
				'https://bagvaly.test/bn/shop?category=tote',
				'https://bagvaly.test/bn/shop?category=old',
				'https://bagvaly.test/bn/bags/tote-1'
			].sort()
		);
	});
});
