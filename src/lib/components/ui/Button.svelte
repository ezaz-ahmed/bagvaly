<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { m } from '#lib/paraglide/messages.js';

	type Props = Omit<HTMLButtonAttributes & HTMLAnchorAttributes, 'class'> & {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger-outline';
		/** `md` is 48px; `lg` (56px) is for the main call to action. */
		size?: 'md' | 'lg';
		fullWidth?: boolean;
		/** Renders an `<a>` instead of a `<button>`. */
		href?: string;
		loading?: boolean;
		disabled?: boolean;
		class?: string;
		children: Snippet;
	};

	let {
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		href,
		loading = false,
		disabled = false,
		type = 'button',
		class: className,
		children,
		...rest
	}: Props = $props();

	const inactive = $derived(disabled || loading);

	const classes = $derived([
		'relative inline-flex items-center justify-center gap-2 rounded-md px-6 text-base font-semibold no-underline transition-colors duration-tap ease-brand',
		size === 'lg' ? 'min-h-14' : 'min-h-tap',
		fullWidth && 'w-full',
		// Variant classes are skipped when disabled so the two colour sets never compete.
		disabled
			? 'cursor-not-allowed bg-sand-300 text-ink-600'
			: {
					primary: 'bg-burgundy-600 text-ivory-50 hover:bg-burgundy-700',
					secondary: 'border-[1.5px] border-burgundy-600 text-burgundy-600 hover:bg-rose-50',
					ghost: 'text-ink-900 hover:bg-sand-200',
					'danger-outline': 'border-[1.5px] border-error-700 text-error-700 hover:bg-error-50'
				}[variant],
		loading && 'cursor-progress',
		className
	]);
</script>

{#snippet content()}
	<!-- The label stays in the layout under the spinner so the width does not jump. -->
	<span class={['inline-flex items-center gap-2', loading && 'invisible']}
		>{@render children()}</span
	>
	{#if loading}
		<span
			class="absolute top-1/2 left-1/2 -mt-2.5 -ml-2.5 size-5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:[animation-duration:2s]"
			><span class="sr-only">{m.ui_loading()}</span></span
		>
	{/if}
{/snippet}

{#if href}
	<!-- A disabled link has no href, so it cannot be followed or focused. -->
	<a
		{...rest}
		href={inactive ? undefined : href}
		class={classes}
		aria-disabled={inactive || undefined}
		aria-busy={loading || undefined}
		role={inactive ? 'link' : undefined}>{@render content()}</a
	>
{:else}
	<button {...rest} {type} class={classes} disabled={inactive} aria-busy={loading || undefined}
		>{@render content()}</button
	>
{/if}
