<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';

	interface Props {
		tone: 'new' | 'sale' | 'best-seller' | 'sold-out';
		/** Overrides the tone's default label. */
		children?: Snippet;
	}

	let { tone, children }: Props = $props();

	const tones = {
		new: { class: 'bg-rose-50 text-burgundy-600', label: m.ui_badge_new },
		sale: { class: 'bg-burgundy-600 text-ivory-50', label: m.ui_badge_sale },
		'best-seller': { class: 'bg-card text-ink-900', label: m.ui_badge_best_seller },
		'sold-out': {
			class: 'border border-sand-300 bg-sand-200 text-ink-900',
			label: m.ui_badge_sold_out
		}
	};
</script>

<!-- Bangla has no letter case, so it drops the uppercase and tracking. -->
<span
	class={[
		'inline-flex items-center rounded-pill px-2.5 py-1 text-xs leading-snug font-semibold tracking-[.12em] whitespace-nowrap uppercase [&:lang(bn)]:tracking-normal [&:lang(bn)]:normal-case',
		tones[tone].class
	]}
>
	{#if children}{@render children()}{:else}{tones[tone].label()}{/if}
</span>
