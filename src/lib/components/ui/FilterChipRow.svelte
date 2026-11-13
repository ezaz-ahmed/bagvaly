<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Names the filter, e.g. "Category". */
		label: string;
		children: Snippet;
	}

	let { label, children }: Props = $props();
</script>

<!-- Scrolls sideways and never wraps; the scrollbar is hidden but touch, wheel and Tab still scroll.
     The padding keeps focus rings from being clipped. -->
<div
	role="group"
	aria-label={label}
	class="flex [scrollbar-width:none] flex-nowrap gap-2 overflow-x-auto p-1.5 [&::-webkit-scrollbar]:hidden"
>
	{@render children()}
</div>
