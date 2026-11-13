<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tone?: 'neutral' | 'success' | 'warning' | 'error';
		/** The status in words; the dot alone never carries meaning. */
		children: Snippet;
	}

	let { tone = 'neutral', children }: Props = $props();

	const tones = {
		neutral: 'bg-sand-200 text-ink-900 before:bg-ink-600',
		success: 'bg-success-50 text-success-700 before:bg-success-700',
		warning: 'bg-warning-50 text-warning-700 before:bg-warning-700',
		error: 'bg-error-50 text-error-700 before:bg-error-700'
	};
</script>

<span
	class={[
		'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-sm font-semibold whitespace-nowrap before:size-2 before:rounded-pill',
		tones[tone]
	]}>{@render children()}</span
>
