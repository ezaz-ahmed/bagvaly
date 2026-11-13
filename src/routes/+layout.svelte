<script lang="ts">
	import { page } from '$app/state';
	import { baseLocale, locales, localizeUrl } from '#lib/paraglide/runtime.js';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#each locales as locale (locale)}
		<link rel="alternate" hreflang={locale} href={localizeUrl(page.url, { locale }).href} />
	{/each}
	<link
		rel="alternate"
		hreflang="x-default"
		href={localizeUrl(page.url, { locale: baseLocale }).href}
	/>
</svelte:head>

{@render children()}
