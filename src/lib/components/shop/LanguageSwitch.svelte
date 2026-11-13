<script lang="ts">
	import type { Path } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getLocale, localizeHref, locales } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';

	interface Props {
		/** `ivory` sits on the burgundy footer; `ink` on ivory backgrounds. */
		tone?: 'ink' | 'ivory';
		/** Shows only a pill for the other language (desktop header). */
		compact?: boolean;
	}

	let { tone = 'ink', compact = false }: Props = $props();

	// Endonyms, so each name reads the same in both locales.
	const names = { en: 'English', bn: 'বাংলা' };
	const current = getLocale();
	const shown = $derived(compact ? locales.filter((locale) => locale !== current) : locales);
</script>

<!-- Full page loads (data-sveltekit-reload) so every message, `<html lang>` and the cache key
     switch together; the URL alone carries the locale. -->
<div role="group" aria-label={m.layout_language()} class="flex gap-2">
	{#each shown as locale (locale)}
		<a
			href={resolve(localizeHref(page.url.pathname + page.url.search, { locale }) as Path)}
			hreflang={locale}
			lang={locale}
			aria-current={locale === current ? 'true' : undefined}
			data-sveltekit-reload
			class={[
				'inline-flex items-center justify-center font-semibold no-underline transition-colors duration-tap ease-brand',
				compact
					? 'min-h-10 rounded-pill border border-sand-300 px-3 text-sm font-medium text-ink-900 hover:bg-sand-200 hover:text-ink-900'
					: 'min-h-tap rounded-md border px-5',
				!compact &&
					tone === 'ivory' &&
					(locale === current
						? 'border-ivory-50 bg-ivory-50 text-burgundy-600 hover:text-burgundy-600'
						: 'border-ivory-50 text-ivory-50 hover:bg-burgundy-700 hover:text-ivory-50'),
				!compact &&
					tone === 'ink' &&
					(locale === current
						? 'border-burgundy-600 bg-burgundy-600 text-ivory-50 hover:text-ivory-50'
						: 'border-burgundy-600 text-burgundy-600 hover:bg-rose-50 hover:text-burgundy-600')
			]}>{names[locale]}</a
		>
	{/each}
</div>
