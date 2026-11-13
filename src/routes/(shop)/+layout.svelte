<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { Icon } from '#lib/components/ui/index.ts';
	import SiteFooter from '#lib/components/shop/SiteFooter.svelte';
	import SiteHeader from '#lib/components/shop/SiteHeader.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="flex min-h-dvh flex-col">
	<a
		href="#main"
		class="sr-only rounded-md bg-ivory-50 px-4 py-3 font-semibold focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
		>{m.layout_skip_to_content()}</a
	>
	<p
		class="m-0 flex h-10 items-center justify-center gap-2 bg-burgundy-600 px-gutter text-center text-sm font-medium text-ivory-50"
	>
		<Icon name="cash" size={18} />{m.layout_announcement()}
	</p>
	<SiteHeader />
	<main id="main" tabindex="-1" class="flex-1">
		{@render children()}
	</main>
	<SiteFooter />
</div>
