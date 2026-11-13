import { and, asc, desc, eq, inArray, lt, gt, ne, or, sql, type SQL } from 'drizzle-orm';
import * as v from 'valibot';
import { localized } from '#lib/localized.ts';
import type { Db } from '#lib/server/db/index.ts';
import { categories, productImages, products, productVariants } from '#lib/server/db/schema.ts';

// Storefront reads (issue #62). Everything returned here can end up in a cached public page, so it
// never includes stock counts: only `inStock` booleans (AGENTS.md section 11).

export const PRODUCT_SORTS = ['newest', 'price_asc', 'price_desc'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 48;

export type CatalogImage = { key: string; alt: string; width: number; height: number };

/** One product card: everything a listing needs, nothing more. */
export type ProductListItem = {
	id: number;
	slug: string;
	name: string;
	price: number;
	compareAtPrice: number | null;
	isNew: boolean;
	isBestSeller: boolean;
	/** True when any colour has stock. */
	inStock: boolean;
	colourCount: number;
	cover: CatalogImage | null;
};

export async function listCategories(db: Db, locale: string) {
	const rows = await db
		.select({ slug: categories.slug, nameEn: categories.nameEn, nameBn: categories.nameBn })
		.from(categories)
		.orderBy(asc(categories.position), asc(categories.id));
	return rows.map((row) => ({ slug: row.slug, name: localized(row.nameEn, row.nameBn, locale) }));
}

// Per-product aggregates as correlated subqueries, so a page of cards is one SQL statement.
const coverId = sql`(select pi.id from product_images pi where pi.product_id = ${products.id} order by pi.position, pi.id limit 1)`;

const cardColumns = {
	id: products.id,
	slug: products.slug,
	nameEn: products.nameEn,
	nameBn: products.nameBn,
	price: products.price,
	compareAtPrice: products.compareAtPrice,
	createdAt: products.createdAt,
	isNew: products.isNew,
	isBestSeller: products.isBestSeller,
	inStock: sql<number>`exists (select 1 from product_variants pv where pv.product_id = ${products.id} and pv.stock > 0)`,
	colourCount: sql<number>`(select count(*) from product_variants pv where pv.product_id = ${products.id})`,
	coverKey: productImages.r2Key,
	coverAltEn: productImages.altEn,
	coverAltBn: productImages.altBn,
	coverWidth: productImages.width,
	coverHeight: productImages.height
};

function selectCards(db: Db, where: SQL | undefined, orderBy: SQL[], limit: number) {
	return db
		.select(cardColumns)
		.from(products)
		.leftJoin(productImages, eq(productImages.id, coverId))
		.where(where)
		.orderBy(...orderBy)
		.limit(limit);
}

type CardRow = Awaited<ReturnType<typeof selectCards>>[number];

function toCard(row: CardRow, locale: string): ProductListItem {
	const name = localized(row.nameEn, row.nameBn, locale);
	return {
		id: row.id,
		slug: row.slug,
		name,
		price: row.price,
		compareAtPrice: row.compareAtPrice,
		isNew: row.isNew,
		isBestSeller: row.isBestSeller,
		inStock: Boolean(row.inStock),
		colourCount: row.colourCount,
		cover:
			row.coverKey === null
				? null
				: {
						key: row.coverKey,
						alt: localized(row.coverAltEn ?? '', row.coverAltBn, locale) || name,
						// Non-null whenever coverKey is: they come from the same joined row.
						width: row.coverWidth!,
						height: row.coverHeight!
					}
	};
}

const published = eq(products.status, 'published');

// Keyset cursor: the last row's sort value and id. Opaque to clients (base64url JSON).
const cursorSchema = v.object({
	s: v.picklist(PRODUCT_SORTS),
	v: v.pipe(v.number(), v.safeInteger()),
	id: v.pipe(v.number(), v.safeInteger(), v.minValue(1))
});
type Cursor = v.InferOutput<typeof cursorSchema>;

function encodeCursor(cursor: Cursor): string {
	return btoa(JSON.stringify(cursor)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

/** Returns null for anything that is not a cursor this module made for `sort`. */
function decodeCursor(raw: string, sort: ProductSort): Cursor | null {
	try {
		const json = atob(raw.replaceAll('-', '+').replaceAll('_', '/'));
		const result = v.safeParse(cursorSchema, JSON.parse(json));
		return result.success && result.output.s === sort ? result.output : null;
	} catch {
		return null;
	}
}

// Every sort ends with id, so ties (same price or created_at) have a stable order.
const SORTS = {
	newest: {
		column: products.createdAt,
		dir: 'desc',
		value: (row: CardRow) => row.createdAt.getTime()
	},
	price_asc: { column: products.price, dir: 'asc', value: (row: CardRow) => row.price },
	price_desc: { column: products.price, dir: 'desc', value: (row: CardRow) => row.price }
} as const;

function afterCursor(sort: ProductSort, cursor: Cursor): SQL {
	const { column, dir } = SORTS[sort];
	const value = sort === 'newest' ? new Date(cursor.v) : cursor.v;
	const beyond = dir === 'asc' ? gt : lt;
	return or(beyond(column, value), and(eq(column, value), beyond(products.id, cursor.id)))!;
}

export type ListProductsOptions = {
	locale: string;
	/** Category slug; omitted lists every category. */
	category?: string | null;
	sort?: ProductSort;
	/** `nextCursor` from the previous page. Invalid cursors are ignored (first page). */
	cursor?: string | null;
	limit?: number;
};

/** Published products, one page at a time. */
export async function listProducts(
	db: Db,
	{ locale, category, sort = 'newest', cursor, limit = DEFAULT_PAGE_SIZE }: ListProductsOptions
): Promise<{ items: ProductListItem[]; nextCursor: string | null }> {
	const size = Math.min(Math.max(Math.trunc(limit) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
	const after = cursor ? decodeCursor(cursor, sort) : null;
	const { column, dir, value } = SORTS[sort];
	const order = dir === 'asc' ? asc : desc;

	const rows = await selectCards(
		db,
		and(
			published,
			category
				? eq(
						products.categoryId,
						db.select({ id: categories.id }).from(categories).where(eq(categories.slug, category))
					)
				: undefined,
			after ? afterCursor(sort, after) : undefined
		),
		[order(column), order(products.id)],
		size + 1
	);

	const page = rows.slice(0, size);
	const last = page.at(-1);
	return {
		items: page.map((row) => toCard(row, locale)),
		nextCursor:
			rows.length > size && last ? encodeCursor({ s: sort, v: value(last), id: last.id }) : null
	};
}

export const HOME_PRODUCT_COUNT = 4;

/** The newest published products marked "show on home". */
export async function listHomeProducts(db: Db, locale: string): Promise<ProductListItem[]> {
	const rows = await selectCards(
		db,
		and(published, eq(products.showOnHome, true)),
		[desc(products.createdAt), desc(products.id)],
		HOME_PRODUCT_COUNT
	);
	return rows.map((row) => toCard(row, locale));
}

/** Other published products in the same category, newest first. */
export async function listRelated(
	db: Db,
	product: { id: number; categoryId: number },
	locale: string,
	limit = 4
): Promise<ProductListItem[]> {
	const rows = await selectCards(
		db,
		and(published, eq(products.categoryId, product.categoryId), ne(products.id, product.id)),
		[desc(products.createdAt), desc(products.id)],
		Math.min(Math.max(Math.trunc(limit), 1), MAX_PAGE_SIZE)
	);
	return rows.map((row) => toCard(row, locale));
}

/**
 * A product page: published or hidden (hidden is off listings but its link works); draft and
 * unknown slugs give null. Colours carry `inStock` only, never the stock count.
 */
export async function getProductBySlug(db: Db, slug: string, locale: string) {
	const row = await db.query.products.findFirst({
		where: and(eq(products.slug, slug), inArray(products.status, ['published', 'hidden'])),
		columns: {
			id: true,
			slug: true,
			status: true,
			categoryId: true,
			nameEn: true,
			nameBn: true,
			descriptionEn: true,
			descriptionBn: true,
			price: true,
			compareAtPrice: true,
			isNew: true,
			isBestSeller: true,
			sizeEn: true,
			sizeBn: true,
			materialEn: true,
			materialBn: true,
			strapDropEn: true,
			strapDropBn: true,
			insideEn: true,
			insideBn: true,
			youtubeVideoId: true
		},
		with: {
			category: { columns: { slug: true, nameEn: true, nameBn: true } },
			variants: {
				columns: { id: true, colourNameEn: true, colourNameBn: true, colourHex: true, stock: true },
				orderBy: [asc(productVariants.position), asc(productVariants.id)]
			},
			images: {
				columns: {
					variantId: true,
					r2Key: true,
					altEn: true,
					altBn: true,
					width: true,
					height: true
				},
				orderBy: [asc(productImages.position), asc(productImages.id)]
			}
		}
	});
	if (!row) return null;

	const t = (en: string, bn: string) => localized(en, bn, locale);
	const name = t(row.nameEn, row.nameBn);
	const variants = row.variants.map((variant) => ({
		id: variant.id,
		colourName: t(variant.colourNameEn, variant.colourNameBn),
		colourHex: variant.colourHex,
		inStock: variant.stock > 0
	}));
	return {
		id: row.id,
		slug: row.slug,
		/** Hidden products are reachable by link only; pages should not index them. */
		hidden: row.status === 'hidden',
		categoryId: row.categoryId,
		category: { slug: row.category.slug, name: t(row.category.nameEn, row.category.nameBn) },
		name,
		description: t(row.descriptionEn, row.descriptionBn),
		price: row.price,
		compareAtPrice: row.compareAtPrice,
		isNew: row.isNew,
		isBestSeller: row.isBestSeller,
		size: t(row.sizeEn, row.sizeBn),
		material: t(row.materialEn, row.materialBn),
		strapDrop: t(row.strapDropEn, row.strapDropBn),
		inside: t(row.insideEn, row.insideBn),
		youtubeVideoId: row.youtubeVideoId,
		inStock: variants.some((variant) => variant.inStock),
		variants,
		images: row.images.map((image) => ({
			key: image.r2Key,
			alt: t(image.altEn, image.altBn) || name,
			width: image.width,
			height: image.height,
			variantId: image.variantId
		}))
	};
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
