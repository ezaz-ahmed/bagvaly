import * as v from 'valibot';
import { DISTRICTS } from '#lib/districts.ts';
import { normalizeBdPhone } from '#lib/phone.ts';

/** Most units of one colour allowed on one order line (owner decision, issue #61). */
export const MAX_QTY_PER_LINE = 5;

const requiredText = (max: number) => v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(max));
const optionalText = (max: number) =>
	v.optional(v.pipe(v.string(), v.trim(), v.maxLength(max)), '');
/** Attribution params: trimmed, '' and missing become null, overlong values are rejected. */
const attribution = (max: number) =>
	v.pipe(
		v.optional(v.nullable(v.pipe(v.string(), v.trim(), v.maxLength(max))), null),
		v.transform((value) => value || null)
	);

export const checkoutItemSchema = v.object({
	variantId: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
	quantity: v.pipe(v.number(), v.safeInteger(), v.minValue(1), v.maxValue(MAX_QTY_PER_LINE))
});

/**
 * Checkout form input. Prices, totals, fees and stock are deliberately absent: createOrder reads
 * them from D1. Unknown keys (e.g. a tampered `price`) are dropped by `v.object`.
 */
export const checkoutInputSchema = v.object({
	name: requiredText(80),
	/** Any accepted spelling; output is canonical `+8801XXXXXXXXX`. */
	phone: v.pipe(
		v.string(),
		v.transform(normalizeBdPhone),
		v.string('Enter a Bangladeshi mobile number')
	),
	districtId: v.picklist(DISTRICTS.map((district) => district.id)),
	address: requiredText(300),
	areaLandmark: optionalText(120),
	note: optionalText(500),
	items: v.pipe(
		v.array(checkoutItemSchema),
		v.minLength(1),
		v.maxLength(20),
		v.check(
			(items) => new Set(items.map((item) => item.variantId)).size === items.length,
			'Each colour may appear only once'
		)
	),
	/** Generated once per checkout attempt by the client; a retry with the same key is a no-op. */
	idempotencyKey: v.pipe(v.string(), v.regex(/^[A-Za-z0-9_-]{16,64}$/)),
	utmSource: attribution(200),
	utmMedium: attribution(200),
	utmCampaign: attribution(200),
	utmContent: attribution(200),
	utmTerm: attribution(200),
	fbclid: attribution(500)
});

export type CheckoutInput = v.InferOutput<typeof checkoutInputSchema>;
