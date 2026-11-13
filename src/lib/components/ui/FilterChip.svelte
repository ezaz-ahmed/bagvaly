<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = Omit<HTMLButtonAttributes, 'class'> & {
		selected?: boolean;
		children: Snippet;
	};

	let { selected = false, type = 'button', children, ...rest }: Props = $props();
</script>

<button
	{...rest}
	{type}
	aria-pressed={selected}
	class={[
		'inline-flex min-h-tap shrink-0 items-center gap-1 rounded-pill border-[1.5px] px-4 text-sm font-medium whitespace-nowrap transition-colors duration-tap ease-brand',
		selected
			? 'border-burgundy-600 bg-burgundy-600 text-ivory-50'
			: 'border-sand-300 bg-card text-ink-900 hover:bg-rose-50'
	]}>{@render children()}</button
>
