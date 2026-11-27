<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = Omit<HTMLButtonAttributes, 'class'> & {
		selected?: boolean;
		/** Renders a link (a filter that changes the URL); `selected` becomes `aria-current`. */
		href?: string;
		children: Snippet;
	};

	let { selected = false, href, type = 'button', children, ...rest }: Props = $props();

	const classes = $derived([
		'inline-flex min-h-tap shrink-0 items-center gap-1 rounded-pill border-[1.5px] px-4 text-sm font-medium whitespace-nowrap no-underline transition-colors duration-tap ease-brand',
		selected
			? 'border-burgundy-600 bg-burgundy-600 text-ivory-50 hover:text-ivory-50'
			: 'border-sand-300 bg-card text-ink-900 hover:bg-rose-50 hover:text-ink-900'
	]);
</script>

{#if href}
	<a {href} aria-current={selected ? 'page' : undefined} class={classes}>{@render children()}</a>
{:else}
	<button {...rest} {type} aria-pressed={selected} class={classes}>{@render children()}</button>
{/if}
