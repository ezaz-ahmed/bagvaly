<script lang="ts">
	import type { Path } from '$app/types';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button, Icon } from '#lib/components/ui/index.ts';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? m.error_not_found_title() : m.error_generic_title()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto flex max-w-xl flex-col items-center gap-4 px-gutter py-20 text-center">
	<span class="flex size-22 items-center justify-center rounded-pill bg-sand-200 text-gold-700"
		><Icon name="bag" size={40} /></span
	>
	<h1 class="m-0 text-4xl leading-[1.15] font-semibold">
		{notFound ? m.error_not_found_title() : m.error_generic_title()}
	</h1>
	<p class="m-0 text-ink-600">
		{notFound ? m.error_not_found_body() : m.error_generic_body()}
	</p>
	<div class="flex flex-wrap justify-center gap-3">
		<Button href={resolve(localizeHref('/shop') as Path)}>{m.home_hero_cta()}</Button>
		<Button href={resolve(localizeHref('/') as Path)} variant="ghost">{m.error_home()}</Button>
	</div>
</section>
