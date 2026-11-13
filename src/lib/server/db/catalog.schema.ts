import { relations, sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Catalogue tables (issue #60). Money is integer poisha; timestamps are UTC epoch ms, as in auth.schema.ts.
// Bangla text columns default to '' and fall back to English when empty (see src/lib/localized.ts).

export const PRODUCT_STATUSES = ['published', 'draft', 'hidden'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

const nowMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const categories = sqliteTable('categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	nameEn: text('name_en').notNull(),
	nameBn: text('name_bn').notNull().default(''),
	position: integer('position').notNull().default(0)
});

export const products = sqliteTable(
	'products',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		slug: text('slug').notNull().unique(),
		nameEn: text('name_en').notNull(),
		nameBn: text('name_bn').notNull().default(''),
		descriptionEn: text('description_en').notNull().default(''),
		descriptionBn: text('description_bn').notNull().default(''),
		// restrict: a category with products must be emptied before it can be deleted.
		categoryId: integer('category_id')
			.notNull()
			.references(() => categories.id, { onDelete: 'restrict' }),
		price: integer('price').notNull(),
		compareAtPrice: integer('compare_at_price'),
		status: text('status', { enum: PRODUCT_STATUSES }).notNull().default('draft'),
		isNew: integer('is_new', { mode: 'boolean' }).notNull().default(false),
		isBestSeller: integer('is_best_seller', { mode: 'boolean' }).notNull().default(false),
		showOnHome: integer('show_on_home', { mode: 'boolean' }).notNull().default(false),
		includeInMetaCatalog: integer('include_in_meta_catalog', { mode: 'boolean' })
			.notNull()
			.default(false),
		sizeEn: text('size_en').notNull().default(''),
		sizeBn: text('size_bn').notNull().default(''),
		materialEn: text('material_en').notNull().default(''),
		materialBn: text('material_bn').notNull().default(''),
		strapDropEn: text('strap_drop_en').notNull().default(''),
		strapDropBn: text('strap_drop_bn').notNull().default(''),
		insideEn: text('inside_en').notNull().default(''),
		insideBn: text('inside_bn').notNull().default(''),
		youtubeVideoId: text('youtube_video_id'),
		skuPrefix: text('sku_prefix').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(nowMs).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(nowMs)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [
		index('products_status_category_created_idx').on(
			table.status,
			table.categoryId,
			table.createdAt
		),
		index('products_show_on_home_idx').on(table.showOnHome),
		check('products_status_check', sql`${table.status} in ('published', 'draft', 'hidden')`),
		check('products_price_check', sql`${table.price} >= 0`),
		check(
			'products_compare_at_price_check',
			sql`${table.compareAtPrice} is null or ${table.compareAtPrice} > ${table.price}`
		)
	]
);

export const productVariants = sqliteTable(
	'product_variants',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		productId: integer('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		colourNameEn: text('colour_name_en').notNull(),
		colourNameBn: text('colour_name_bn').notNull().default(''),
		colourHex: text('colour_hex').notNull(),
		sku: text('sku').notNull().unique(),
		stock: integer('stock').notNull().default(0),
		position: integer('position').notNull().default(0)
	},
	(table) => [
		index('product_variants_product_position_idx').on(table.productId, table.position),
		check('product_variants_stock_check', sql`${table.stock} >= 0`)
	]
);

export const productImages = sqliteTable(
	'product_images',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		productId: integer('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		// Deleting a colour keeps its photos as general product photos.
		variantId: integer('variant_id').references(() => productVariants.id, {
			onDelete: 'set null'
		}),
		r2Key: text('r2_key').notNull().unique(),
		altEn: text('alt_en').notNull().default(''),
		altBn: text('alt_bn').notNull().default(''),
		width: integer('width').notNull(),
		height: integer('height').notNull(),
		/** 0 = cover. */
		position: integer('position').notNull().default(0)
	},
	(table) => [
		index('product_images_product_position_idx').on(table.productId, table.position),
		index('product_images_variant_idx').on(table.variantId),
		check('product_images_size_check', sql`${table.width} > 0 and ${table.height} > 0`)
	]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
	products: many(products)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
	category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
	variants: many(productVariants),
	images: many(productImages)
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
	product: one(products, { fields: [productVariants.productId], references: [products.id] }),
	images: many(productImages)
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
	product: one(products, { fields: [productImages.productId], references: [products.id] }),
	variant: one(productVariants, {
		fields: [productImages.variantId],
		references: [productVariants.id]
	})
}));
