/**
 * Picks the Bangla text for `bn` when it has content, otherwise the English text.
 * Bangla catalogue fields are optional: "The English text shows until you add it."
 */
export function localized(en: string, bn: string | null | undefined, locale: string): string {
	return locale === 'bn' && bn?.trim() ? bn : en;
}
