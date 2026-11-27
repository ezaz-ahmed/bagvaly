<script lang="ts">
	import type { Path } from '$app/types';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { deLocalizeHref, getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import { numberLocale } from '#lib/money.ts';
	import { cartBadge } from '#lib/cart-badge.svelte.ts';
	import { Icon } from '#lib/components/ui/index.ts';
	import type { IconName } from '#lib/components/ui/Icon.svelte';

	let { onmenu }: { onmenu: () => void } = $props();

	const path = $derived(deLocalizeHref(page.url.pathname));
	const under = (...prefixes: string[]) => prefixes.some((prefix) => path.startsWith(prefix));
	const cartCount = $derived(cartBadge.count);

	type Tab = { href: string; icon: IconName; label: () => string; active: boolean };
	const before: Tab[] = $derived([
		{ href: '/', icon: 'home', label: m.layout_tab_home, active: path === '/' },
		{ href: '/shop', icon: 'grid', label: m.layout_tab_shop, active: under('/shop', '/bags/') }
	]);
	const after: Tab[] = $derived([
		{ href: '/track', icon: 'truck', label: m.layout_tab_track, active: under('/track', '/order/') }
	]);
	const bagActive = $derived(under('/cart', '/checkout'));

	// The gold clasp on the top edge marks the current tab.
	const tabClass =
		'relative flex h-16 flex-col items-center justify-center gap-1 text-xs leading-none font-semibold text-ink-600 no-underline transition-colors duration-tap ease-brand before:absolute before:-top-px before:h-[3px] before:w-7 before:rounded-b-pill before:bg-gold-400 before:opacity-0 hover:text-burgundy-600 aria-[current=page]:text-burgundy-600 aria-[current=page]:before:opacity-100';
</script>

{#snippet tab({ href, icon, label, active }: Tab)}
	<li>
		<a
			href={resolve(localizeHref(href) as Path)}
			aria-current={active ? 'page' : undefined}
			class={tabClass}
		>
			<Icon name={icon} />{label()}
		</a>
	</li>
{/snippet}

<nav
	data-tabbar
	aria-label={m.layout_tab_bar()}
	class="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-ivory-50 pb-[env(safe-area-inset-bottom)] md:hidden"
>
	<ul class="m-0 grid list-none grid-cols-5 p-0">
		{#each before as item (item.href)}{@render tab(item)}{/each}

		<!-- The bag rises above the bar: in a bag shop it is the one action that matters. -->
		<li>
			<a
				href={resolve(localizeHref('/cart') as Path)}
				aria-current={bagActive ? 'page' : undefined}
				aria-label={cartCount ? m.layout_cart_count({ count: cartCount }) : m.layout_cart()}
				class="group flex h-16 flex-col items-center justify-end gap-1 pb-3 text-xs leading-none font-semibold text-burgundy-600 no-underline"
			>
				<span
					class="relative -mt-6 flex size-14 items-center justify-center rounded-pill bg-burgundy-600 text-ivory-50 shadow-md ring-4 ring-ivory-50 transition-[background-color,box-shadow] duration-tap ease-brand group-hover:bg-burgundy-700 group-aria-[current=page]:ring-gold-400"
				>
					<Icon name="bag" size={26} />
					{#if cartCount}
						<span
							aria-hidden="true"
							class="absolute -top-1 -right-1.5 min-w-5 rounded-pill bg-gold-400 px-1.5 text-center text-xs leading-5 font-bold text-ink-900 ring-2 ring-ivory-50"
							>{cartCount.toLocaleString(numberLocale(getLocale()))}</span
						>
					{/if}
				</span>
				<span aria-hidden="true">{m.layout_tab_bag()}</span>
			</a>
		</li>

		{#each after as item (item.href)}{@render tab(item)}{/each}

		<li>
			<button
				type="button"
				aria-haspopup="dialog"
				aria-controls="mobile-menu"
				onclick={onmenu}
				class={[tabClass, 'w-full']}
			>
				<Icon name="menu" />{m.layout_menu()}
			</button>
		</li>
	</ul>
</nav>
