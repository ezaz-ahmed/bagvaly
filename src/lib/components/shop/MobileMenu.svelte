<script lang="ts">
	import type { Path } from '$app/types';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import { categories, helpLinks } from '#lib/config.ts';
	import { Icon } from '#lib/components/ui/index.ts';
	import LanguageSwitch from './LanguageSwitch.svelte';

	// A modal <dialog> gives the focus containment, Esc to close and focus return for free.
	let dialog: HTMLDialogElement;

	export function open() {
		dialog.showModal();
	}

	afterNavigate(() => dialog?.close());

	const linkClass =
		'flex min-h-tap items-center rounded-md px-3 font-medium text-ink-900 no-underline hover:bg-sand-200 hover:text-ink-900';
</script>

<!-- Clicks on the dialog element itself can only be on the backdrop: the panel fills it. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	id="mobile-menu"
	aria-label={m.layout_menu()}
	onclick={(event) => event.target === dialog && dialog.close()}
	class="m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none -translate-x-full bg-background p-0 text-ink-900 shadow-lg transition-[translate,overlay,display] transition-discrete duration-panel ease-brand backdrop:bg-ink-900/40 open:translate-x-0 starting:open:-translate-x-full"
>
	<div class="flex min-h-full flex-col gap-6 px-gutter pt-2 pb-8">
		<div class="-mx-2 flex h-header items-center justify-between">
			<span
				class="px-2 font-heading text-[26px] leading-none font-semibold tracking-[.16em] text-burgundy-600"
				>BAGVALY</span
			>
			<button
				type="button"
				onclick={() => dialog.close()}
				class="flex size-12 items-center justify-center rounded-md hover:bg-sand-200"
			>
				<Icon name="close" label={m.layout_close_menu()} />
			</button>
		</div>

		<nav aria-label={m.layout_categories()} class="-mx-3 flex flex-col">
			<h2
				class="px-3 pb-1 font-body text-xs font-semibold tracking-[.12em] text-ink-600 uppercase [&:lang(bn)]:tracking-normal"
			>
				{m.layout_categories()}
			</h2>
			{#each categories as category (category.slug)}
				<a href={resolve(localizeHref(`/shop?category=${category.slug}`) as Path)} class={linkClass}
					>{category.label()}</a
				>
			{/each}
		</nav>

		<nav aria-label={m.layout_help()} class="-mx-3 flex flex-col border-t border-sand-200 pt-4">
			{#each helpLinks as link (link.path)}
				<a href={resolve(localizeHref(link.path) as Path)} class={linkClass}>{link.label()}</a>
			{/each}
		</nav>

		<div class="mt-auto">
			<LanguageSwitch />
		</div>
	</div>
</dialog>

<style>
	/* Body scroll lock while the menu is open. */
	:global(html:has(#mobile-menu[open])) {
		overflow: hidden;
	}
</style>
