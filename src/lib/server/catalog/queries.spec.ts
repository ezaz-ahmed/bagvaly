import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import {
	categories,
	productImages,
	products,
	productVariants,
	type ProductStatus
} from '#lib/server/db/schema.ts';
import { createTestDb } from '#lib/server/db/test-db.ts';
import {
	getProductBySlug,
	listCategories,
	listHomeProducts,
	listProducts,
	listRelated,
	type ProductSort
} from './queries';

let t: Awaited<ReturnType<typeof createTestDb>>;
let seq = 0;

beforeAll(async () => {
	t = await createTestDb();
});
afterAll(() => t.dispose());

async function category(nameBn = '') {
	const n = ++seq;
	const [row] = await t.db
		.insert(categories)
		.values({ slug: `cat-${n}`, nameEn: `Cat ${n}`, nameBn, position: -n })
		.returning();
	return row;
}

type ProductOptions = {
	categoryId: number;
	price?: number;
	status?: ProductStatus;
	createdAt?: Date;
	showOnHome?: boolean;
	stocks?: number[];
	nameBn?: string;
	images?: { position: number; altEn?: string; altBn?: string }[];
};

async function product({
	categoryId,
	price = 100_000,
	status = 'published',
	createdAt = new Date(Date.UTC(2026, 0, 1)),
	showOnHome = false,
	stocks = [1],
	nameBn = '',
	images = []
}: ProductOptions) {
	const n = ++seq;
	const [row] = await t.db
		.insert(products)
		.values({
			slug: `bag-${n}`,
			nameEn: `Bag ${n}`,
			nameBn,
			categoryId,
			price,
			status,
			createdAt,
			showOnHome,
			skuPrefix: `B${n}`
		})
		.returning();
	for (const [i, stock] of stocks.entries()) {
		await t.db.insert(productVariants).values({
			productId: row.id,
			colourNameEn: `Colour ${i}`,
			colourNameBn: i === 0 ? 'কালো' : '',
			colourHex: '#292525',
			sku: `B${n}-${i}`,
			stock,
			position: i
		});
	}
	for (const image of images) {
		await t.db.insert(productImages).values({
			productId: row.id,
			r2Key: `products/${n}/${image.position}.jpg`,
			altEn: image.altEn ?? '',
			altBn: image.altBn ?? '',
			width: 800,
			height: 1000,
			position: image.position
		});
	}
	return row;
}

/** Walks every page with `limit` and returns the slugs in order. */
async function allSlugs(categorySlug: string, sort: ProductSort, limit: number) {
	const slugs: string[] = [];
	let cursor: string | null = null;
	let pages = 0;
	do {
		const page = await listProducts(t.db, {
			locale: 'en',
			category: categorySlug,
			sort,
			cursor,
			limit
		});
		slugs.push(...page.items.map((item) => item.slug));
		cursor = page.nextCursor;
		pages++;
	} while (cursor && pages < 20);
	return slugs;
}

describe('listProducts', () => {
	it('lists only published products of the category', async () => {
		const [a, b] = [await category(), await category()];
		const visible = await product({ categoryId: a.id });
		await product({ categoryId: a.id, status: 'hidden' });
		await product({ categoryId: a.id, status: 'draft' });
		const other = await product({ categoryId: b.id });

		const page = await listProducts(t.db, { locale: 'en', category: a.slug });
		expect(page.items.map((item) => item.slug)).toEqual([visible.slug]);
		expect(page.nextCursor).toBeNull();

		const all = await listProducts(t.db, { locale: 'en', limit: 48 });
		expect(all.items.map((item) => item.slug)).toEqual(
			expect.arrayContaining([visible.slug, other.slug])
		);
		expect((await listProducts(t.db, { locale: 'en', category: 'no-such' })).items).toEqual([]);
	});

	it('sorts and paginates with ties in a stable order', async () => {
		const c = await category();
		const day = (d: number) => new Date(Date.UTC(2026, 1, d));
		// Two price ties and two created_at ties, so page breaks fall inside tied groups.
		const p1 = await product({ categoryId: c.id, price: 300, createdAt: day(1) });
		const p2 = await product({ categoryId: c.id, price: 100, createdAt: day(2) });
		const p3 = await product({ categoryId: c.id, price: 200, createdAt: day(2) });
		const p4 = await product({ categoryId: c.id, price: 200, createdAt: day(3) });
		const p5 = await product({ categoryId: c.id, price: 200, createdAt: day(4) });

		const newest = [p5, p4, p3, p2, p1].map((p) => p.slug); // tie on day 2: higher id first
		const priceAsc = [p2, p3, p4, p5, p1].map((p) => p.slug); // ties: lower id first
		const priceDesc = [p1, p5, p4, p3, p2].map((p) => p.slug); // ties: higher id first

		for (const limit of [1, 2, 5]) {
			expect(await allSlugs(c.slug, 'newest', limit)).toEqual(newest);
			expect(await allSlugs(c.slug, 'price_asc', limit)).toEqual(priceAsc);
			expect(await allSlugs(c.slug, 'price_desc', limit)).toEqual(priceDesc);
		}
	});

	it('ignores tampered cursors and cursors from another sort, and caps the limit', async () => {
		const c = await category();
		for (let i = 0; i < 3; i++) await product({ categoryId: c.id });
		const first = await listProducts(t.db, { locale: 'en', category: c.slug, limit: 1 });
		const fromOtherSort = await listProducts(t.db, {
			locale: 'en',
			category: c.slug,
			sort: 'price_asc',
			cursor: first.nextCursor,
			limit: 1
		});
		const expected = (
			await listProducts(t.db, { locale: 'en', category: c.slug, sort: 'price_asc', limit: 1 })
		).items;
		expect(fromOtherSort.items).toEqual(expected);

		for (const cursor of ['garbage', btoa('{"s":"newest","v":"x","id":1}'), btoa('[]')]) {
			const page = await listProducts(t.db, { locale: 'en', category: c.slug, cursor, limit: 1 });
			expect(page.items).toEqual(first.items);
		}

		const capped = await listProducts(t.db, { locale: 'en', limit: 10_000 });
		expect(capped.items.length).toBeLessThanOrEqual(48);
	});

	it('returns card fields with cover, colour count and stock flag, never stock numbers', async () => {
		const c = await category();
		const p = await product({
			categoryId: c.id,
			stocks: [0, 7, 0],
			nameBn: 'ব্যাগ',
			images: [
				{ position: 1, altEn: 'Side' },
				{ position: 0, altEn: 'Front', altBn: 'সামনে' }
			]
		});
		const soldOut = await product({ categoryId: c.id, stocks: [0, 0] });

		const { items } = await listProducts(t.db, { locale: 'bn', category: c.slug });
		const card = items.find((item) => item.slug === p.slug);
		expect(card).toEqual({
			id: p.id,
			slug: p.slug,
			name: 'ব্যাগ',
			price: p.price,
			compareAtPrice: null,
			isNew: false,
			isBestSeller: false,
			inStock: true,
			colourCount: 3,
			cover: { key: expect.stringMatching(/\/0\.jpg$/), alt: 'সামনে', width: 800, height: 1000 }
		});
		const empty = items.find((item) => item.slug === soldOut.slug);
		expect(empty).toMatchObject({
			inStock: false,
			colourCount: 2,
			cover: null,
			name: soldOut.nameEn
		});
		expect(JSON.stringify(items)).not.toMatch(/stock"?:\s*\d/);
	});
});

describe('getProductBySlug', () => {
	it('returns published and hidden products, but not drafts', async () => {
		const c = await category();
		const pub = await product({ categoryId: c.id });
		const hidden = await product({ categoryId: c.id, status: 'hidden' });
		const draft = await product({ categoryId: c.id, status: 'draft' });

		expect(await getProductBySlug(t.db, pub.slug, 'en')).toMatchObject({ hidden: false });
		expect(await getProductBySlug(t.db, hidden.slug, 'en')).toMatchObject({ hidden: true });
		expect(await getProductBySlug(t.db, draft.slug, 'en')).toBeNull();
		expect(await getProductBySlug(t.db, 'no-such-bag', 'en')).toBeNull();
	});

	it('localizes with English fallback and exposes only in-stock flags', async () => {
		const c = await category('টোট');
		const p = await product({
			categoryId: c.id,
			stocks: [3, 0],
			images: [{ position: 0, altEn: 'Front' }]
		});

		const bn = await getProductBySlug(t.db, p.slug, 'bn');
		expect(bn).toMatchObject({
			name: p.nameEn, // no Bangla name: English shows
			category: { slug: c.slug, name: 'টোট' },
			inStock: true,
			variants: [
				{ colourName: 'কালো', inStock: true },
				{ colourName: 'Colour 1', inStock: false }
			],
			images: [{ alt: 'Front', width: 800, height: 1000, variantId: null }]
		});
		expect(bn!.variants[0]).not.toHaveProperty('stock');
		expect(JSON.stringify(bn)).not.toContain('stock"');

		const en = await getProductBySlug(t.db, p.slug, 'en');
		expect(en!.category.name).toBe(c.nameEn);
		expect(en!.variants[0].colourName).toBe('Colour 0');
	});
});

describe('home, related and categories', () => {
	it('lists the newest four published home products', async () => {
		const c = await category();
		const day = (d: number) => new Date(Date.UTC(2030, 0, d)); // newer than every other test row
		const home = [];
		for (let d = 1; d <= 5; d++)
			home.push(await product({ categoryId: c.id, showOnHome: true, createdAt: day(d) }));
		await product({ categoryId: c.id, showOnHome: true, status: 'hidden', createdAt: day(9) });
		await product({ categoryId: c.id, createdAt: day(9) });

		const items = await listHomeProducts(t.db, 'en');
		expect(items.map((item) => item.slug)).toEqual(
			home
				.slice(1)
				.reverse()
				.map((p) => p.slug)
		);
	});

	it('lists related published products from the same category, excluding the product', async () => {
		const [a, b] = [await category(), await category()];
		const self = await product({ categoryId: a.id });
		const sibling = await product({ categoryId: a.id });
		await product({ categoryId: a.id, status: 'hidden' });
		await product({ categoryId: b.id });

		const items = await listRelated(t.db, self, 'en', 4);
		expect(items.map((item) => item.slug)).toEqual([sibling.slug]);
	});

	it('lists categories by position with Bangla fallback', async () => {
		const c = await category('ক্রসবডি');
		const plain = await category();
		const list = await listCategories(t.db, 'bn');
		// position = -n, so the later category comes first.
		expect(list.slice(0, 2)).toEqual([
			{ slug: plain.slug, name: plain.nameEn },
			{ slug: c.slug, name: 'ক্রসবডি' }
		]);
	});
});
