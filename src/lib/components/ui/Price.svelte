<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { priceParts } from './price';

	interface Props {
		/** Current price in poisha. */
		amount: number;
		/** Regular price in poisha; shown struck through only when it is a real discount. */
		compareAt?: number | null;
		size?: 'md' | 'lg' | 'hero';
	}

	let { amount, compareAt, size = 'md' }: Props = $props();

	const parts = $derived(priceParts(amount, compareAt, getLocale()));
</script>

<span
	class={[
		'inline-flex flex-wrap items-baseline gap-x-2 leading-snug',
		size === 'lg' ? 'text-xl' : 'text-base'
	]}
>
	<span
		class={[
			'font-semibold whitespace-nowrap text-ink-900',
			size === 'hero' && 'font-heading text-3xl'
		]}>{parts.now}</span
	>
	{#if parts.was !== null && parts.percent !== null}
		<span class="sr-only">{m.ui_price_regular()}</span>
		<del class="text-sm whitespace-nowrap text-ink-600">{parts.was}</del>
		<span class="text-sm font-semibold text-gold-700"
			>{m.ui_percent_off({ percent: parts.percent })}</span
		>
	{/if}
</span>
