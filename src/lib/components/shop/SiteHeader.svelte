<script lang="ts">
	import type { Path } from '$app/types';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import { readCartCount } from '#lib/cart-count.ts';
	import { categories } from '#lib/config.ts';
	import { Icon } from '#lib/components/ui/index.ts';
	import LanguageSwitch from './LanguageSwitch.svelte';
	import MobileMenu from './MobileMenu.svelte';

	let menu: MobileMenu;

	// Client-only: cached HTML must never carry a visitor's cart.
	let cartCount = $state(0);
	onMount(() => {
		cartCount = readCartCount(document.cookie);
	});

	const iconButton =
		'flex size-12 items-center justify-center rounded-md text-ink-900 hover:bg-sand-200 hover:text-ink-900';
</script>

<header class="sticky top-0 z-30 border-b border-sand-200 bg-background">
	<div
		class="mx-auto flex h-header max-w-page items-center justify-between gap-6 px-2 md:px-gutter"
	>
		<button
			type="button"
			aria-haspopup="dialog"
			aria-controls="mobile-menu"
			onclick={() => menu.open()}
			class={[iconButton, 'lg:hidden']}
		>
			<Icon name="menu" label={m.layout_open_menu()} />
		</button>

		<a
			href={resolve(localizeHref('/') as Path)}
			aria-label={m.layout_home()}
			class="font-heading text-[26px] leading-none font-semibold tracking-[.16em] text-burgundy-600 no-underline hover:text-burgundy-700 md:text-[30px]"
			>BAGVALY</a
		>

		<nav aria-label={m.layout_main_nav()} class="hidden flex-1 flex-wrap gap-x-2 lg:flex">
			{#each categories as category (category.slug)}
				<a
					href={resolve(localizeHref(`/shop?category=${category.slug}`) as Path)}
					class="flex min-h-tap items-center px-3 font-medium text-ink-900 no-underline transition-colors duration-tap ease-brand hover:text-burgundy-600"
					>{category.label()}</a
				>
			{/each}
		</nav>

		<div class="flex items-center gap-1">
			<div class="hidden lg:block"><LanguageSwitch compact /></div>
			<a
				href={resolve(localizeHref('/cart') as Path)}
				aria-label={cartCount ? m.layout_cart_count({ count: cartCount }) : m.layout_cart()}
				class={[iconButton, 'relative']}
			>
				<Icon name="bag" />
				{#if cartCount}
					<span
						aria-hidden="true"
						class="absolute top-1.5 right-1 min-w-[18px] rounded-pill bg-burgundy-600 px-[5px] text-center text-xs leading-[18px] font-semibold text-ivory-50"
						>{cartCount.toLocaleString(getLocale() === 'bn' ? 'bn-BD' : 'en-US')}</span
					>
				{/if}
			</a>
		</div>
	</div>
</header>

<MobileMenu bind:this={menu} />
