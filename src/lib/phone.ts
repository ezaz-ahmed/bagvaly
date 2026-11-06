const BENGALI_ZERO = 0x09e6;
const CANONICAL_BD_MOBILE = /^\+8801[3-9]\d{8}$/;

/**
 * Normalizes a Bangladeshi mobile number to the canonical `+8801XXXXXXXXX` form.
 * Accepts `01…`, `8801…`, `+8801…`, spaces, dashes, and Bengali digits.
 * Returns `null` for anything that is not a valid Bangladeshi mobile number.
 */
export function normalizeBdPhone(input: string): string | null {
	const ascii = input.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - BENGALI_ZERO));
	const compact = ascii.trim().replace(/[\s-]/g, '');

	let candidate: string;
	if (compact.startsWith('+880')) candidate = compact;
	else if (compact.startsWith('880')) candidate = `+${compact}`;
	else if (compact.startsWith('01')) candidate = `+88${compact}`;
	else return null;

	return CANONICAL_BD_MOBILE.test(candidate) ? candidate : null;
}

/** True only for numbers already in the canonical `+8801XXXXXXXXX` form. */
export function isCanonicalBdPhone(input: string): boolean {
	return CANONICAL_BD_MOBILE.test(input);
}
