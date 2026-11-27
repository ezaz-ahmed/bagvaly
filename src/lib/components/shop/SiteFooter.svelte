<script lang="ts">
	import type { Path } from '$app/types';
	import { resolve } from '$app/paths';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import { numberLocale } from '#lib/money.ts';
	import { contact, helpLinks, socialLinks } from '#lib/config.ts';
	import { Icon } from '#lib/components/ui/index.ts';
	import LanguageSwitch from './LanguageSwitch.svelte';

	const socials = socialLinks.filter((link) => link.url);
	const year = new Intl.NumberFormat(numberLocale(getLocale()), {
		useGrouping: false
	}).format(new Date().getFullYear());

	const link =
		'flex min-h-tap items-center gap-2 text-ivory-50 no-underline hover:text-ivory-50 hover:underline';
</script>

<footer class="mt-auto bg-burgundy-600 text-ivory-50">
	<div
		class="mx-auto grid max-w-page gap-8 px-gutter pt-10 pb-8 md:grid-cols-[2fr_1fr_1fr] md:pt-14"
	>
		<div class="flex flex-col gap-2">
			<span
				class="font-heading text-[28px] leading-none font-semibold tracking-[.16em] md:text-[30px]"
				>BAGVALY</span
			>
			<span class="font-heading text-[22px] leading-snug font-medium">{m.layout_tagline()}</span>
		</div>

		<nav aria-label={m.layout_footer_nav()} class="flex flex-col">
			<a href={resolve(localizeHref('/shop') as Path)} class={link}>{m.layout_shop_all()}</a>
			{#each helpLinks as help (help.path)}
				<a href={resolve(localizeHref(help.path) as Path)} class={link}>{help.label()}</a>
			{/each}
		</nav>

		<div class="flex flex-col gap-4">
			{#if contact.whatsapp || contact.phone}
				<div class="flex flex-col">
					{#if contact.whatsapp}
						<a href="https://wa.me/{contact.whatsapp}" rel="external" class={link}
							><Icon name="whatsapp" size={20} />{m.layout_whatsapp()}</a
						>
					{/if}
					{#if contact.phone}
						<a href="tel:{contact.phone}" rel="external" class={link}
							><Icon name="phone" size={20} />{m.layout_call({ phone: contact.phone })}</a
						>
					{/if}
				</div>
			{/if}

			{#if socials.length}
				<ul aria-label={m.layout_social()} class="flex flex-wrap gap-2">
					{#each socials as social (social.name)}
						<li>
							<a
								href={social.url}
								rel="external"
								class="flex min-h-tap items-center rounded-pill border border-ivory-50 px-4 text-sm font-medium text-ivory-50 no-underline hover:bg-burgundy-700 hover:text-ivory-50"
								>{social.name}</a
							>
						</li>
					{/each}
				</ul>
			{/if}

			<LanguageSwitch tone="ivory" />
		</div>

		<p
			class="m-0 flex flex-wrap justify-between gap-2 border-t border-gold-400 pt-4 text-sm md:col-span-3"
		>
			<span>{m.layout_copyright({ year })}</span>
			<span>{m.layout_announcement()}</span>
		</p>
	</div>
</footer>
