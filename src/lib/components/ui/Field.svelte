<!-- Label, help text and error shared by TextField, TextArea and Select. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';
	import Icon from './Icon.svelte';

	interface Props {
		id: string;
		label: string;
		hint?: string;
		error?: string;
		optional?: boolean;
		children: Snippet<[{ describedby: string | undefined; invalid: boolean }]>;
	}

	let { id, label, hint, error, optional = false, children }: Props = $props();

	const describedby = $derived(
		[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
	);
</script>

<div class="flex flex-col gap-1">
	<label for={id} class="text-sm font-medium text-ink-900">
		{label}
		{#if optional}<span class="font-normal text-ink-600">{m.ui_optional()}</span>{/if}
	</label>
	{@render children({ describedby, invalid: !!error })}
	{#if hint}<p id="{id}-hint" class="text-sm text-ink-600">{hint}</p>{/if}
	{#if error}
		<p id="{id}-error" class="flex items-center gap-1 text-sm text-error-700">
			<Icon name="alert" size={18} />{error}
		</p>
	{/if}
</div>
