<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Field from './Field.svelte';

	type Props = Omit<HTMLInputAttributes, 'class' | 'id'> & {
		id?: string;
		label: string;
		hint?: string;
		/** A short fix, e.g. "Enter 11 digits, starting 01". */
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
		<input
			{...rest}
			{id}
			bind:value
			aria-invalid={invalid || undefined}
			aria-describedby={describedby}
			class="min-h-tap w-full rounded-sm border-[1.5px] border-sand-300 bg-card px-4 text-base text-ink-900 focus:border-burgundy-600 focus:ring-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold-400 aria-invalid:border-error-700"
		/>
	{/snippet}
</Field>
