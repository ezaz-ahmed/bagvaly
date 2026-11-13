<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import Field from './Field.svelte';

	type Props = Omit<HTMLTextareaAttributes, 'class' | 'id'> & {
		id?: string;
		label: string;
		hint?: string;
		error?: string;
		optional?: boolean;
	};

	const uid = $props.id();

	let {
		label,
		hint,
		error,
		optional = false,
		value = $bindable(),
		id = uid,
		...rest
	}: Props = $props();
</script>

<Field {id} {label} {hint} {error} {optional}>
	{#snippet children({ describedby, invalid })}
		<textarea
			{...rest}
			{id}
			bind:value
			aria-invalid={invalid || undefined}
			aria-describedby={describedby}
			class="min-h-24 w-full resize-y rounded-sm border-[1.5px] border-sand-300 bg-card px-4 py-3 text-base text-ink-900 focus:border-burgundy-600 focus:ring-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold-400 aria-invalid:border-error-700"
		></textarea>
	{/snippet}
</Field>
