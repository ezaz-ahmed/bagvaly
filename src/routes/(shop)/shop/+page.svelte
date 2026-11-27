<script lang="ts">
	import type { Path } from '$app/types';
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { Button, FilterChip, FilterChipRow, Icon } from '#lib/components/ui/index.ts';
	import ProductGrid from '#lib/components/shop/ProductGrid.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = getLocale();

	type ShopParams = { category?: string | null; sort?: string; cursor?: string | null };

	/** Localized `/shop` path with only the non-default params. */
	function shopPath({ category, sort, cursor }: ShopParams) {
		const query = [
			category && `category=${encodeURIComponent(category)}`,
			sort && sort !== 'newest' && `sort=${encodeURIComponent(sort)}`,
			cursor && `cursor=${encodeURIComponent(cursor)}`
		].filter(Boolean);
		return localizeHref(`/shop${query.length ? `?${query.join('&')}` : ''}`) as Path;
	}
	const shopHref = (params: ShopParams) => resolve(shopPath(params));

	const sorts = [
		{ value: 'newest', label: m.shop_sort_newest },
		{ value: 'price_asc', label: m.shop_sort_price_asc },
		{ value: 'price_desc', label: m.shop_sort_price_desc }
	];

	const title = $derived(data.category?.name ?? m.shop_title_all());
	const metaTitle = $derived(
		data.category
			? m.shop_meta_title_category({ category: data.category.name })
			: m.shop_meta_title()
	);

	// "Load more" keeps the cards already shown and appends the next page. Without JS it is a plain
	// link to the next page.
	let earlier = $state<typeof data.products>([]);
	let loadingMore = $state(false);
	const products = $derived.by(() => {
		const all = [...earlier, ...data.products];
		return all.filter((p, i) => all.findIndex((q) => q.slug === p.slug) === i);
	});

	beforeNavigate(() => {
		if (!loadingMore) earlier = [];
	});

	const nextPath = $derived(
		data.nextCursor
			? shopPath({ category: data.category?.slug, sort: data.sort, cursor: data.nextCursor })
			: null
	);

	async function loadMore(event: MouseEvent) {
		if (!nextPath) return;
		event.preventDefault();
		loadingMore = true;
		earlier = products;
		try {
			await goto(resolve(nextPath), { reset: false, replace: true });
		} finally {
			loadingMore = false;
		}
	}
</script>

<svelte:head>
	<title>{metaTitle}</title>
	<meta name="description" content={m.shop_meta_description()} />
	<link rel="canonical" href={data.canonical} />
	{#if data.cursor || data.sort !== 'newest'}<meta name="robots" content="noindex, follow" />{/if}
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={m.site_name()} />
	<meta property="og:title" content={metaTitle} />
	<meta property="og:description" content={m.shop_meta_description()} />
	<meta property="og:url" content={data.canonical} />
	<meta property="og:locale" content={locale === 'bn' ? 'bn_BD' : 'en_US'} />
</svelte:head>

<div class="mx-auto flex max-w-page flex-col gap-4 px-gutter pt-6 pb-12 lg:gap-6 lg:pt-10 lg:pb-16">
	<div class="flex flex-col gap-1">
		<nav aria-label={m.shop_breadcrumb()} class="text-sm text-ink-600">
			<a href={resolve(localizeHref('/') as Path)} class="text-ink-600">{m.shop_home()}</a>
			<span aria-hidden="true"> / </span>
			{#if data.category}
				<a href={shopHref({})} class="text-ink-600">{m.shop_title_all()}</a>
			{:else}
				<span>{m.shop_title_all()}</span>
			{/if}
		</nav>
		<h1 class="m-0 text-4xl leading-[1.15] font-semibold tracking-[-0.005em] lg:text-5xl">
			{title}
		</h1>
	</div>

	<div class="-mx-1.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
		<FilterChipRow label={m.shop_filter_label()}>
			<FilterChip href={shopHref({ sort: data.sort })} selected={!data.category}>
				{m.shop_title_all()}
			</FilterChip>
			{#each data.categories as category (category.slug)}
				<FilterChip
					href={shopHref({ category: category.slug, sort: data.sort })}
					selected={data.category?.slug === category.slug}>{category.name}</FilterChip
				>
			{/each}
		</FilterChipRow>

		<!-- A GET form, so sorting works without JS; with JS it submits on change. -->
		<form method="GET" class="flex items-center gap-2 px-1.5" data-sveltekit-reset="false">
			{#if data.category}<input type="hidden" name="category" value={data.category.slug} />{/if}
			<label for="sort" class="flex items-center gap-1 text-sm font-medium whitespace-nowrap">
				<Icon name="sliders" size={20} />{m.shop_sort_label()}
			</label>
			<select
				id="sort"
				name="sort"
				value={data.sort}
				onchange={(event) => event.currentTarget.form?.requestSubmit()}
				class="min-h-tap rounded-md border-[1.5px] border-sand-300 bg-card py-0 pr-10 pl-3 text-sm text-ink-900 focus:border-burgundy-600 focus:ring-0"
			>
				{#each sorts as sort (sort.value)}
					<option value={sort.value}>{sort.label()}</option>
				{/each}
			</select>
			<noscript><Button type="submit" variant="secondary">{m.shop_sort_apply()}</Button></noscript>
		</form>
	</div>

	{#if data.cursor && earlier.length === 0}
		<a
			href={shopHref({ category: data.category?.slug, sort: data.sort })}
			class="text-sm font-semibold">{m.shop_from_start()}</a
		>
	{/if}

	{#if products.length}
		<ProductGrid {products} priorityCount={2} showColours />
		{#if nextPath}
			<div class="flex justify-center pt-4">
				<Button
					href={resolve(nextPath)}
					variant="secondary"
					fullWidth
					class="md:w-auto"
					loading={loadingMore}
					onclick={loadMore}>{m.shop_load_more()}</Button
				>
			</div>
		{/if}
	{:else}
		<div class="flex flex-col items-center gap-4 py-16 text-center">
			<span class="flex size-22 items-center justify-center rounded-pill bg-sand-200 text-gold-700"
				><Icon name="bag" size={40} /></span
			>
			<h2 class="m-0 text-[28px] leading-[1.15] font-semibold">{m.shop_empty_title()}</h2>
			<p class="m-0 text-ink-600">{m.shop_empty_body()}</p>
			{#if data.category}
				<Button href={shopHref({})}>{m.shop_empty_cta()}</Button>
			{/if}
		</div>
	{/if}
</div>
