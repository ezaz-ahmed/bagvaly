import * as v from 'valibot';
import { PRODUCT_STATUSES } from '#lib/server/db/catalog.schema.ts';

// Input schemas for the admin product editor. Prices are integer poisha (convert form taka with
// toPoisha from #lib/money.ts first). Bangla fields are optional: '' means "show the English text".

const requiredText = (max: number) => v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(max));
const optionalText = (max: number) =>
	v.optional(v.pipe(v.string(), v.trim(), v.maxLength(max)), '');
const poisha = v.pipe(v.number(), v.safeInteger(), v.minValue(0));

export const slugSchema = v.pipe(
	v.string(),
	v.maxLength(80),
	v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, digits and single hyphens')
);

export const skuSchema = v.pipe(
	v.string(),
	v.trim(),
	v.toUpperCase(),
	v.maxLength(40),
	v.regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, 'Use letters, digits and single hyphens')
);

/** An 11-character YouTube video ID (not a URL). Empty means no video. */
export const youtubeVideoIdSchema = v.pipe(
	v.optional(v.nullable(v.pipe(v.string(), v.trim())), null),
	v.transform((id) => id || null),
	v.nullable(v.pipe(v.string(), v.regex(/^[A-Za-z0-9_-]{11}$/, 'Not a YouTube video ID')))
);

export const variantInputSchema = v.object({
	colourNameEn: requiredText(40),
	colourNameBn: optionalText(40),
	colourHex: v.pipe(
		v.string(),
		v.trim(),
		v.regex(/^#[0-9a-fA-F]{6}$/, 'Use a colour like #790b27'),
		v.toLowerCase()
	),
	sku: skuSchema,
	stock: v.pipe(v.number(), v.safeInteger(), v.minValue(0))
});

export const productInputSchema = v.pipe(
	v.object({
		slug: slugSchema,
		nameEn: requiredText(120),
		nameBn: optionalText(120),
		descriptionEn: optionalText(5000),
		descriptionBn: optionalText(5000),
		categoryId: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
		price: poisha,
		compareAtPrice: v.optional(v.nullable(poisha), null),
		status: v.picklist(PRODUCT_STATUSES),
		isNew: v.optional(v.boolean(), false),
		isBestSeller: v.optional(v.boolean(), false),
		showOnHome: v.optional(v.boolean(), false),
		includeInMetaCatalog: v.optional(v.boolean(), false),
		sizeEn: optionalText(80),
		sizeBn: optionalText(80),
		materialEn: optionalText(80),
		materialBn: optionalText(80),
		strapDropEn: optionalText(80),
		strapDropBn: optionalText(80),
		insideEn: optionalText(200),
		insideBn: optionalText(200),
		youtubeVideoId: youtubeVideoIdSchema,
		skuPrefix: skuSchema,
		/** In display order; position is the array index. */
		variants: v.pipe(v.array(variantInputSchema), v.minLength(1, 'Add at least one colour'))
	}),
	v.forward(
		v.partialCheck(
			[['price'], ['compareAtPrice']],
			(p) => p.compareAtPrice === null || p.compareAtPrice > p.price,
			'"Was" price must be higher than the price'
		),
		['compareAtPrice']
	),
	v.forward(
		v.partialCheck(
			[['variants', '$', 'sku']],
			(p) => new Set(p.variants.map((variant) => variant.sku)).size === p.variants.length,
			'Each colour needs its own SKU'
		),
		['variants']
	)
);

export type ProductInput = v.InferOutput<typeof productInputSchema>;
