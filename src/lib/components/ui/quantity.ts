/** Clamps a quantity into `[min, max]`; `min` wins when `max < min` (e.g. stock 0). */
export function clampQuantity(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(value, max));
}

/** The quantity after pressing − (`-1`) or + (`+1`), kept within bounds. */
export function stepQuantity(value: number, delta: -1 | 1, min: number, max: number): number {
	return clampQuantity(value + delta, min, max);
}
