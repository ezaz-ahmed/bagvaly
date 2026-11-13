<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import Field from './Field.svelte';

	type Props = Omit<HTMLSelectAttributes, 'class' | 'id'> & {
		id?: string;
		label: string;
		/** Include a `{ value: '', label: '…' }` first option for a prompt. */
		options: { value: string; label: string }[];
		hint?: string;
		error?: string;
		optional?: boolean;
	};

	const uid = $props.id();

	let {
		label,
		options,
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
		<!-- @tailwindcss/forms draws the chevron. -->
		<select
			{...rest}
			{id}
			bind:value
			aria-invalid={invalid || undefined}
			aria-describedby={describedby}
			class="min-h-tap w-full rounded-sm border-[1.5px] border-sand-300 bg-card px-4 pr-10 text-base text-ink-900 focus:border-burgundy-600 focus:ring-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold-400 aria-invalid:border-error-700"
		>
			{#each options as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	{/snippet}
</Field>
