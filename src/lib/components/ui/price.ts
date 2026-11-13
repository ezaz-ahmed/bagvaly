import { discountPercent, formatPrice } from '#lib/money.ts';

/**
 * What `Price` shows: the current price, plus the struck-through compare-at price and the
 * percent off only when it is a real discount (see `discountPercent`).
 */
export function priceParts(amount: number, compareAt: number | null | undefined, locale: string) {
	const percent = discountPercent(amount, compareAt);
	return {
		now: formatPrice(amount, locale),
		was: percent === null ? null : formatPrice(compareAt as number, locale),
		percent:
			percent === null
				? null
				: new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US').format(percent)
	};
}
