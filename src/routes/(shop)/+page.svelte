<script lang="ts">
	import { numberLocale } from '#lib/money.ts';
	import type { Path } from '$app/types';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { categories, contact, occasions } from '#lib/config.ts';
	import { DELIVERY_ZONES } from '#lib/delivery.ts';
	import { Button, Icon } from '#lib/components/ui/index.ts';
	import ProductGrid from '#lib/components/shop/ProductGrid.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// The locale only changes with a full page load (LanguageSwitch), so plain constants are fine.
	const locale = getLocale();
	const otherLocale = locale === 'bn' ? 'en' : 'bn';
	const n = new Intl.NumberFormat(numberLocale(locale)).format;
	const { inside_dhaka: inside, outside_dhaka: outside } = DELIVERY_ZONES;
	const shopHref = (query = '') => resolve(localizeHref(`/shop${query}`) as Path);

	// Placeholder tiles until the owner supplies photos; each then gets an `@sveltejs/enhanced-img`
	// import rendered with `<enhanced:img>` in place of the icon.
	const tiles = [
		{
			label: m.home_tile_campus,
			bag: m.layout_category_backpack,
			class: 'row-span-2 bg-sand-200 text-gold-700 lg:row-span-3'
		},
		{
			label: m.home_tile_office,
			bag: m.layout_category_tote,
			class: 'bg-rose-50 text-burgundy-600 lg:row-span-2'
		},
		{
			label: m.home_tile_weekend,
			bag: m.layout_category_crossbody,
			class: 'bg-sand-300 text-burgundy-700 lg:row-span-2'
		},
		{
			label: m.home_tile_festive,
			bag: m.layout_category_clutch,
			class: 'col-span-2 bg-ink-900 text-gold-400'
		}
	];

	const trust = [
		{ icon: 'cash', title: m.home_trust_cod_title(), body: m.home_trust_cod_body() },
		{
			icon: 'truck',
			title: m.home_trust_delivery_title(),
			body: m.home_trust_delivery_body({
				insideMin: n(inside.etaDays.min),
				insideMax: n(inside.etaDays.max),
				outsideMin: n(outside.etaDays.min),
				outsideMax: n(outside.etaDays.max)
			})
		},
		{ icon: 'exchange', title: m.home_trust_exchange_title(), body: m.home_trust_exchange_body() }
	] as const;

	const h2 = 'm-0 text-[28px] leading-[1.15] font-semibold tracking-[-0.005em] lg:text-4xl';
	// Horizontal scroller on phones, grid from lg.
	const scroller =
		'm-0 flex list-none gap-3 overflow-x-auto px-gutter [scrollbar-width:none] lg:grid lg:px-0';
</script>

<svelte:head>
	<title>{m.home_meta_title()}</title>
	<meta name="description" content={m.home_meta_description()} />
	<link rel="canonical" href={data.canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={m.site_name()} />
	<meta property="og:title" content={m.home_meta_title()} />
	<meta property="og:description" content={m.home_meta_description()} />
	<meta property="og:url" content={data.canonical} />
	<meta property="og:locale" content={locale === 'bn' ? 'bn_BD' : 'en_US'} />
	<meta property="og:locale:alternate" content={locale === 'bn' ? 'en_US' : 'bn_BD'} />
</svelte:head>

<!-- Phones: copy, mosaic, call to action. lg: copy and call to action left, mosaic right. -->
<section
	aria-labelledby="hero-title"
	class="mx-auto grid max-w-[1280px] gap-6 px-gutter pt-7 pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:grid-rows-[1fr_auto] lg:gap-x-12 lg:gap-y-5 lg:py-14"
>
	<div class="flex flex-col gap-4 lg:gap-5 lg:self-end">
		<span
			class="self-start rounded-pill border border-burgundy-600 px-3 py-1 text-xs leading-snug font-bold tracking-[.12em] text-burgundy-600"
			>{m.home_hero_eyebrow()}</span
		>
		<!-- The LCP element: text in a swap font, so nothing waits for an image or a font file. -->
		<h1
			id="hero-title"
			class="m-0 text-[60px] leading-[.98] font-bold tracking-[-0.035em] lg:text-[clamp(56px,7.4vw,108px)] lg:leading-[.95] lg:tracking-[-0.04em] [&:lang(bn)]:text-[44px] [&:lang(bn)]:leading-[1.3] [&:lang(bn)]:tracking-normal lg:[&:lang(bn)]:text-[64px]"
		>
			{m.home_hero_title()}
			<em class="font-medium text-burgundy-600 [&:lang(bn)]:not-italic">{m.home_hero_title_em()}</em
			>
		</h1>
		<p class="m-0 max-w-[30rem] text-lg leading-normal text-ink-600 lg:text-xl">
			{m.home_hero_sub()}
		</p>
	</div>

	<div
		class="grid grid-cols-2 grid-rows-[190px_190px_150px] gap-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:grid-cols-3 lg:grid-rows-[repeat(3,160px)] lg:gap-3 lg:self-end"
	>
		{#each tiles as tile, i (tile.label)}
			<div class={['relative flex items-center justify-center rounded-lg', tile.class]}>
				<Icon name="bag" size={i ? 32 : 40} />
				<span
					class="absolute bottom-2.5 left-2.5 rounded-pill bg-ivory-50 px-3 py-1 text-sm font-bold text-ink-900 lg:bottom-3 lg:left-3"
					>{tile.label()} <span class="font-medium text-ink-600">· {tile.bag()}</span></span
				>
			</div>
		{/each}
	</div>

	<div class="flex flex-col gap-2.5 lg:gap-3">
		<div class="flex flex-wrap gap-3">
			<Button href={shopHref()} size="lg" fullWidth class="lg:w-auto">
				{m.home_hero_cta()}<Icon name="arrow-right" size={18} />
			</Button>
			{#if contact.whatsapp}
				<div class="hidden lg:block">
					<Button
						href="https://wa.me/{contact.whatsapp}"
						rel="external"
						variant="secondary"
						size="lg"
					>
						<Icon name="whatsapp" size={20} />{m.home_hero_whatsapp()}
					</Button>
				</div>
			{/if}
		</div>
		<!-- The tagline in the other language, as in the design's bilingual line. Semibold reuses the
		     Hind Siliguri 600 file the footer already loads; 400 would add ~70KB to the English page. -->
		<p lang={otherLocale} class="m-0 text-center font-semibold text-ink-600 lg:text-left">
			{m.layout_tagline({}, { locale: otherLocale })}
		</p>
	</div>
</section>

<div
	aria-hidden="true"
	class="mb-12 overflow-hidden bg-burgundy-600 px-gutter py-3.5 font-heading text-[28px] leading-[1.1] font-medium whitespace-nowrap text-ivory-50 italic lg:mb-16 lg:flex lg:flex-wrap lg:justify-center lg:py-[18px] lg:text-[clamp(28px,2.5vw,36px)] lg:whitespace-normal [&:lang(bn)]:not-italic"
>
	{#each categories as category, i (category.slug)}
		{#if i}<span class="mx-4 text-gold-400 lg:mx-6">✦</span>{/if}<span>{category.label()}</span>
	{/each}
</div>

<section
	aria-labelledby="styles-title"
	class="mx-auto flex max-w-page flex-col gap-4 pb-12 lg:gap-6 lg:px-gutter lg:pb-16"
>
	<h2 id="styles-title" class={[h2, 'px-gutter lg:px-0']}>{m.home_styles_title()}</h2>
	<ul class={[scroller, 'lg:grid-cols-6 lg:gap-4']}>
		{#each categories as category (category.slug)}
			<li class="w-[84px] shrink-0 lg:w-auto">
				<a
					href={shopHref(`?category=${category.slug}`)}
					class="flex flex-col items-center gap-2 text-center text-sm leading-snug font-medium text-ink-900 no-underline hover:text-burgundy-600 lg:gap-2.5 lg:text-base"
				>
					<span
						class="flex size-[76px] items-center justify-center rounded-pill bg-sand-200 text-gold-700 lg:size-32"
						><Icon name="bag" size={28} /></span
					>
					{category.label()}
				</a>
			</li>
		{/each}
	</ul>
</section>

<section
	aria-labelledby="new-title"
	class="mx-auto flex max-w-page flex-col gap-4 px-gutter pb-12 lg:gap-6 lg:pb-16"
>
	<div class="flex items-center justify-between gap-2">
		<h2 id="new-title" class={h2}>{m.home_new_title()}</h2>
		<a
			href={shopHref()}
			class="flex min-h-tap items-center gap-1 text-sm font-semibold no-underline lg:text-base"
			>{m.home_view_all()}<Icon name="chevron-right" size={18} /></a
		>
	</div>
	{#if data.products.length}
		<ProductGrid products={data.products} />
	{:else}
		<p class="m-0 text-ink-600">{m.home_new_empty()}</p>
	{/if}
</section>

<section aria-label={m.home_trust_label()} class="bg-sand-200">
	<ul
		class="m-0 mx-auto grid max-w-page list-none gap-5 px-gutter py-8 lg:grid-cols-3 lg:gap-6 lg:py-10"
	>
		{#each trust as item (item.icon)}
			<li class="flex items-start gap-4">
				<span
					class="flex size-11 shrink-0 items-center justify-center rounded-pill bg-ivory-50 text-gold-700 lg:size-12"
					><Icon name={item.icon} /></span
				>
				<div>
					<p class="m-0 font-semibold lg:text-lg">{item.title}</p>
					<p class="m-0 text-sm lg:text-base">{item.body}</p>
				</div>
			</li>
		{/each}
	</ul>
</section>

<section
	aria-labelledby="occasions-title"
	class="mx-auto flex max-w-page flex-col gap-4 py-12 lg:gap-6 lg:px-gutter lg:py-16"
>
	<h2 id="occasions-title" class={[h2, 'px-gutter lg:px-0']}>{m.home_occasions_title()}</h2>
	<ul class={[scroller, 'lg:grid-cols-3 lg:gap-6']}>
		{#each occasions as occasion (occasion.category)}
			<li class="w-60 shrink-0 lg:w-auto">
				<a
					href={shopHref(`?category=${occasion.category}`)}
					class="flex flex-col gap-2 text-lg leading-snug font-medium text-ink-900 no-underline hover:text-burgundy-600 lg:gap-3 lg:font-heading lg:text-[28px] lg:font-semibold"
				>
					<!-- Placeholder until the owner supplies occasion photos. -->
					<span
						class="flex aspect-[4/5] items-center justify-center rounded-lg bg-sand-200 text-gold-700"
						><Icon name="bag" size={40} /></span
					>
					{occasion.label()}
				</a>
			</li>
		{/each}
	</ul>
</section>

<!-- Hidden until the owner's numbers are in config.ts: placeholder numbers never ship. -->
{#if contact.whatsapp || contact.phone}
	<section aria-labelledby="help-title" class="mx-auto max-w-page px-gutter pb-12 lg:pb-16">
		<div
			class="flex flex-col gap-3 rounded-lg border border-sand-300 bg-card px-5 py-6 lg:items-start lg:p-8"
		>
			<h2 id="help-title" class={h2}>{m.home_help_title()}</h2>
			<p class="m-0 text-ink-600">{m.home_help_body()}</p>
			{#if contact.whatsapp}
				<Button href="https://wa.me/{contact.whatsapp}" rel="external" variant="secondary">
					<Icon name="whatsapp" size={22} />{m.layout_whatsapp()}
				</Button>
			{/if}
			{#if contact.phone}
				<Button href="tel:{contact.phone}" rel="external" variant="ghost">
					<Icon name="phone" size={20} />{m.layout_call({ phone: contact.phone })}
				</Button>
			{/if}
		</div>
	</section>
{/if}
