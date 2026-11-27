/** Money is stored and calculated as integer poisha (৳1 = 100 poisha). */

/** `Intl` locale for numbers in the active UI locale: Bangla digits for `bn`, else English. */
export const numberLocale = (locale: string) => (locale === 'bn' ? 'bn-BD' : 'en-US');

/**
 * Converts a taka amount (e.g. from an admin form) to integer poisha.
 * Throws for non-finite, negative, or sub-poisha (more than 2 decimals) amounts.
 */
export function toPoisha(taka: number): number {
	const poisha = Math.round(taka * 100);
	// The multiply can be off by a float epsilon (19.99 * 100 = 1998.999…); anything more is a third decimal.
	if (!Number.isSafeInteger(poisha) || poisha < 0 || Math.abs(taka * 100 - poisha) > 1e-6) {
		throw new RangeError(`Invalid taka amount: ${taka}`);
	}
	return poisha;
}

/**
 * Formats integer poisha for display: `৳ 1,450`, `৳ 19.99`, or `৳ ১,৪৫০` for `bn`.
 * Decimals are shown only when the amount is not whole taka. Negative amounts render as `-৳ 50`.
 */
export function formatPrice(poisha: number, locale: string = 'en'): string {
	if (!Number.isSafeInteger(poisha)) throw new RangeError(`Invalid poisha amount: ${poisha}`);
	const abs = Math.abs(poisha);
	const digits = abs % 100 === 0 ? 0 : 2;
	const number = new Intl.NumberFormat(numberLocale(locale), {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(abs / 100);
	return `${poisha < 0 ? '-' : ''}৳ ${number}`;
}

/**
 * Whole percent saved versus `compareAt`, or `null` when there is no real discount
 * (missing compare-at price, compare-at not above price, or a discount that rounds to 0%).
 */
export function discountPercent(
	price: number,
	compareAt: number | null | undefined
): number | null {
	if (compareAt === null || compareAt === undefined || price < 0 || compareAt <= price) return null;
	const percent = Math.round(((compareAt - price) * 100) / compareAt);
	return percent > 0 ? percent : null;
}
