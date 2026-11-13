<script lang="ts">
	import type { Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fly } from 'svelte/transition';
	import { m } from '#lib/paraglide/messages.js';
	import Icon from './Icon.svelte';

	interface Props {
		tone?: 'success' | 'error';
		children: Snippet;
		ondismiss: () => void;
		/** Auto-dismiss delay in ms; errors default to `null` and stay until dismissed. */
		duration?: number | null;
	}

	let { tone = 'success', children, ondismiss, duration }: Props = $props();

	const delay = $derived(duration === undefined ? (tone === 'success' ? 4000 : null) : duration);

	$effect(() => {
		if (delay === null) return;
		// Called inside the callback so a new `ondismiss` function does not restart the timer.
		const timer = setTimeout(() => ondismiss(), delay);
		return () => clearTimeout(timer);
	});
</script>

<!-- Placement (top on mobile, bottom on desktop) is the consumer's job. -->
<div
	role={tone === 'error' ? 'alert' : 'status'}
	class={[
		'flex max-w-md items-start gap-3 rounded-md py-1 pr-1 pl-4 leading-snug text-ink-900 shadow-lg',
		tone === 'error' ? 'bg-error-50' : 'bg-success-50'
	]}
	transition:fly={{ y: -8, duration: prefersReducedMotion.current ? 0 : 240 }}
>
	<Icon
		name={tone === 'error' ? 'alert' : 'check'}
		class={['mt-3', tone === 'error' ? 'text-error-700' : 'text-success-700']}
	/>
	<p class="flex-1 py-3">{@render children()}</p>
	<button
		type="button"
		class="grid size-tap shrink-0 place-items-center rounded-md"
		aria-label={m.ui_dismiss()}
		onclick={ondismiss}><Icon name="close" size={20} /></button
	>
</div>
