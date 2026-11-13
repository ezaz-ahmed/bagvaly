import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const env = vi.hoisted(() => ({ dev: false, zone: 'a'.repeat(32), token: 'test-token' }));
vi.mock('$app/env', () => ({
	get dev() {
		return env.dev;
	}
}));
vi.mock('$app/env/private', () => ({
	get CACHE_PURGE_ZONE_ID() {
		return env.zone;
	},
	get CACHE_PURGE_TOKEN() {
		return env.token;
	}
}));

const { purgeUrls, PURGE_URLS_PER_REQUEST } = await import('./purge');

const ok = () => Response.json({ success: true, errors: [], messages: [], result: { id: 'x' } });
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
	Object.assign(env, { dev: false, zone: 'a'.repeat(32), token: 'test-token' });
	fetchMock = vi.fn(async () => ok());
	vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

const urls = (n: number) => Array.from({ length: n }, (_, i) => `https://bagvaly.test/bags/b-${i}`);

describe('purgeUrls', () => {
	it('POSTs the URLs to the zone purge endpoint with a bearer token', async () => {
		expect(await purgeUrls(urls(2))).toBe(true);
		expect(fetchMock).toHaveBeenCalledOnce();
		const [endpoint, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(endpoint).toBe(
			`https://api.cloudflare.com/client/v4/zones/${'a'.repeat(32)}/purge_cache`
		);
		expect(init.method).toBe('POST');
		expect(init.headers).toMatchObject({
			Authorization: 'Bearer test-token',
			'Content-Type': 'application/json'
		});
		expect(JSON.parse(init.body as string)).toEqual({ files: urls(2) });
	});

	it('splits large purges into requests of at most the API limit', async () => {
		const all = urls(PURGE_URLS_PER_REQUEST * 2 + 1);
		await purgeUrls(all);
		const sent = fetchMock.mock.calls.map(
			([, init]) => JSON.parse((init as RequestInit).body as string).files
		);
		expect(sent.map((files: string[]) => files.length)).toEqual([
			PURGE_URLS_PER_REQUEST,
			PURGE_URLS_PER_REQUEST,
			1
		]);
		expect(sent.flat()).toEqual(all);
	});

	it('is skipped in dev and for an empty list', async () => {
		env.dev = true;
		expect(await purgeUrls(urls(1))).toBe(false);
		env.dev = false;
		expect(await purgeUrls([])).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it.each([['zone' as const], ['token' as const]])(
		'warns without leaking the token and skips when the %s is unset',
		async (key) => {
			env[key] = '';
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			expect(await purgeUrls(urls(1))).toBe(false);
			expect(fetchMock).not.toHaveBeenCalled();
			expect(warn).toHaveBeenCalledOnce();
			expect(JSON.stringify(warn.mock.calls)).not.toContain('test-token');
		}
	);

	it('throws on a failed purge, without the token in the message', async () => {
		fetchMock.mockResolvedValueOnce(Response.json({ success: false }, { status: 403 }));
		await expect(purgeUrls(urls(1))).rejects.toThrow(/HTTP 403/);
		fetchMock.mockResolvedValueOnce(Response.json({ success: false }));
		await expect(purgeUrls(urls(1))).rejects.toThrow(/purge failed/);
		await expect(purgeUrls(urls(1)).catch((e: Error) => e.message)).resolves.not.toContain(
			'test-token'
		);
	});
});
