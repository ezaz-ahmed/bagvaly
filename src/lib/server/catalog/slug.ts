const MAX_SLUG_LENGTH = 80;

/**
 * URL slug from an English name: lowercase ASCII words joined by hyphens, at most 80 characters.
 * Accents are stripped (`Café` → `cafe`). Input with no ASCII letters or digits (empty, or Bangla only)
 * gets a stable `bag-<hash>` slug so the same name always maps to the same slug.
 * Uniqueness is not checked here: on a clash the caller must pick another slug.
 */
export function slugify(name: string): string {
	const slug = name
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.slice(0, MAX_SLUG_LENGTH)
		.replace(/^-+|-+$/g, '');
	return slug || `bag-${fnv1a(name.trim()).toString(36)}`;
}

/** 32-bit FNV-1a over UTF-16 code units: short, deterministic, not cryptographic. */
function fnv1a(text: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}
