<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import ContactOptions from '#lib/components/shop/ContactOptions.svelte';
</script>

<svelte:head>
	<title>{m.help_contact_meta_title()}</title>
	<meta name="description" content={m.help_contact_intro()} />
</svelte:head>

<div class="mx-auto flex max-w-2xl flex-col gap-6 px-gutter pt-8 pb-16 lg:pt-12">
	<h1 class="m-0 text-4xl leading-[1.15] font-semibold tracking-[-0.005em]">
		{m.layout_contact_us()}
	</h1>
	<p class="m-0 text-lg text-ink-600">{m.help_contact_intro()}</p>
	<ContactOptions />
	<p class="m-0 text-ink-600">{m.home_help_body()}</p>
</div>
