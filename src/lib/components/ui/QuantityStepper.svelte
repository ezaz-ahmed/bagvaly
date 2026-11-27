<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { numberLocale } from '#lib/money.ts';
	import Icon from './Icon.svelte';
	import { stepQuantity } from './quantity';

	interface Props {
		value: number;
		min?: number;
		/** Pass the available stock. */
		max?: number;
		/** Accessible name for the group, e.g. the product name. */
		label?: string;
		onchange?: (value: number) => void;
	}

	let { value = $bindable(), min = 1, max = 10, label, onchange }: Props = $props();

	function step(delta: -1 | 1) {
		value = stepQuantity(value, delta, min, max);
		onchange?.(value);
	}

	const buttonClass =
		'grid size-tap place-items-center rounded-md text-ink-900 disabled:cursor-not-allowed disabled:text-sand-300';
</script>

<div
	role="group"
	aria-label={label ?? m.ui_quantity()}
	class="inline-flex w-fit items-center rounded-md border-[1.5px] border-sand-300 bg-card"
>
	<button
		type="button"
		class={buttonClass}
		disabled={value <= min}
		aria-label={m.ui_quantity_decrease()}
		onclick={() => step(-1)}><Icon name="minus" /></button
	>
	<output class="min-w-7 text-center font-semibold" aria-live="polite"
		>{value.toLocaleString(numberLocale(getLocale()))}</output
	>
	<button
		type="button"
		class={buttonClass}
		disabled={value >= max}
		aria-label={m.ui_quantity_increase()}
		onclick={() => step(1)}><Icon name="plus" /></button
	>
</div>
