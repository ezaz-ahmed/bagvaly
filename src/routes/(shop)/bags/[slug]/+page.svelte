<script lang="ts">
	import type { Path } from '$app/types';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { refreshCartBadge } from '#lib/cart-badge.svelte.ts';
	import { contact } from '#lib/config.ts';
	import { DELIVERY_ZONES } from '#lib/delivery.ts';
	import { formatPrice, numberLocale } from '#lib/money.ts';
	import { Badge, Button, Icon, Price, QuantityStepper, Toast } from '#lib/components/ui/index.ts';
	import ProductGrid from '#lib/components/shop/ProductGrid.svelte';
	import ProductImage from '#lib/components/shop/ProductImage.svelte';
	import VideoFacade from '#lib/components/shop/VideoFacade.svelte';
	import { cardBadge } from '#lib/components/shop/product-card.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const locale = getLocale();
	const n = new Intl.NumberFormat(numberLocale(locale)).format;
	const product = $derived(data.product);

	// Writable deriveds: picks reset when another product's page reuses this component. The
	// default colour is the first with stock, so it can be bought.
	let variantId = $derived(product.variants.find((v) => v.inStock)?.id ?? product.variants[0]?.id);
	const variant = $derived(product.variants.find((v) => v.id === variantId));
	let quantity = $derived.by(() => {
		void product.id; // back to 1 on another product
		return 1;
	});

	// The picked colour's photos first, then general ones; all photos when it has none of its own.
	const images = $derived.by(() => {
		const own = product.images.filter((image) => image.variantId === variantId);
		const general = product.images.filter((image) => image.variantId === null);
		const list = [...own, ...general];
		return list.length ? list : product.images;
	});
	let active = $derived.by(() => {
		void variantId; // first photo again when the colour changes
		return 0;
	});
	const shown = $derived(images[Math.min(active, images.length - 1)] ?? null);

	const badge = $derived(
		cardBadge({ ...product, colourCount: product.variants.length, image: null })
	);

	let adding = $state(false);
	let toast = $state<{ tone: 'success' | 'error'; text: string } | null>(null);
	$effect(() => {
		if (!form) return;
		toast =
			'added' in form
				? { tone: 'success', text: m.product_added({ colour: form.colour ?? '' }) }
				: {
						tone: 'error',
						text: form.error === 'sold_out' ? m.product_sold_out_colour() : m.product_limit()
					};
	});

	const cartHref = resolve(localizeHref('/cart') as Path);
	const whatsappHref = $derived(
		contact.whatsapp
			? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
					m.product_whatsapp_text({
						name: product.name,
						colour: variant?.colourName ?? '',
						url: data.canonical
					})
				)}`
			: null
	);
	const zones = [
		{ label: m.product_delivery_inside, zone: DELIVERY_ZONES.inside_dhaka },
		{ label: m.product_delivery_outside, zone: DELIVERY_ZONES.outside_dhaka }
	];
	const details = $derived(
		[
			{ label: m.product_size(), value: product.size },
			{ label: m.product_material(), value: product.material },
			{ label: m.product_strap_drop(), value: product.strapDrop },
			{ label: m.product_inside(), value: product.inside }
		].filter((row) => row.value)
	);
	const h2 = 'm-0 text-[28px] leading-[1.15] font-semibold tracking-[-0.005em]';
</script>

<svelte:head>
	<title>{m.product_meta_title({ name: product.name })}</title>
	<meta
		name="description"
		content={product.description.slice(0, 160) || m.shop_meta_description()}
	/>
	<link rel="canonical" href={data.canonical} />
	{#if product.hidden}<meta name="robots" content="noindex" />{/if}
	<meta property="og:type" content="product" />
	<meta property="og:site_name" content={m.site_name()} />
	<meta property="og:title" content={product.name} />
	<meta property="og:description" content={product.description.slice(0, 200)} />
	<meta property="og:url" content={data.canonical} />
	<meta property="og:locale" content={locale === 'bn' ? 'bn_BD' : 'en_US'} />
	<meta property="og:locale:alternate" content={locale === 'bn' ? 'en_US' : 'bn_BD'} />
	{#if data.ogImage}<meta property="og:image" content={data.ogImage} />{/if}
	<meta property="product:price:amount" content={String(product.price / 100)} />
	<meta property="product:price:currency" content="BDT" />
</svelte:head>

{#if toast}
	<div class="fixed inset-x-gutter top-20 z-40 flex justify-center md:top-auto md:bottom-6">
		<Toast tone={toast.tone} ondismiss={() => (toast = null)}>
			{toast.text}
			{#if toast.tone === 'success'}
				<a href={cartHref} class="font-semibold">{m.product_view_cart()}</a>
			{/if}
		</Toast>
	</div>
{/if}

<div class="mx-auto max-w-page px-gutter pt-4 pb-12 lg:pt-10">
	<nav aria-label={m.shop_breadcrumb()} class="mb-4 text-sm text-ink-600">
		<a href={resolve(localizeHref('/shop') as Path)} class="text-ink-600">{m.shop_title_all()}</a>
		<span aria-hidden="true"> / </span>
		<a
			href={resolve(localizeHref(`/shop?category=${product.category.slug}`) as Path)}
			class="text-ink-600">{product.category.name}</a
		>
	</nav>

	<div class="grid gap-6 lg:grid-cols-2 lg:gap-12">
		<section
			aria-label={m.product_photos()}
			class="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start"
		>
			<div class="relative">
				<ProductImage
					image={shown}
					alt={shown?.alt ?? ''}
					sizes="(min-width: 64rem) 576px, 100vw"
					priority
					class="rounded-lg"
				/>
				{#if badge}<span class="absolute top-3 left-3"><Badge tone={badge} /></span>{/if}
				{#if images.length > 1}
					<span class="absolute right-3 bottom-3 rounded-pill bg-card px-2.5 text-sm font-medium"
						>{n(active + 1)} / {n(images.length)}</span
					>
				{/if}
			</div>
			{#if images.length > 1}
				<div role="group" aria-label={m.product_choose_photo()} class="grid grid-cols-5 gap-2">
					{#each images as image, i (image.key)}
						<button
							type="button"
							aria-pressed={i === active}
							aria-label={m.product_photo_n({ n: n(i + 1) })}
							onclick={() => (active = i)}
							class={[
								'overflow-hidden rounded-md border-2',
								i === active ? 'border-ink-900' : 'border-transparent'
							]}
						>
							<ProductImage {image} alt="" sizes="120px" />
						</button>
					{/each}
				</div>
			{/if}
		</section>

		<div class="flex flex-col gap-6">
			<div class="flex flex-col gap-2">
				<h1 class="m-0 text-4xl leading-[1.15] font-semibold tracking-[-0.005em]">
					{product.name}
				</h1>
				<Price amount={product.price} compareAt={product.compareAtPrice} size="hero" />
				<p class="m-0 flex items-center gap-2 text-sm text-ink-600">
					<Icon name="cash" size={18} class="text-gold-700" />{m.product_cod_available()}
				</p>
			</div>

			<form
				method="POST"
				action="?/add"
				id="add-form"
				class="flex flex-col gap-6"
				use:enhance={() => {
					adding = true;
					toast = null;
					return async ({ update }) => {
						await update({ reset: false, refreshAll: false });
						refreshCartBadge();
						adding = false;
					};
				}}
			>
				{#if product.variants.length}
					<fieldset class="m-0 flex flex-col gap-3 border-0 p-0">
						<legend class="mb-3 p-0">
							<span class="font-semibold">{m.product_colour()}</span>
							{variant?.colourName}
						</legend>
						<div class="flex flex-wrap gap-2">
							{#each product.variants as option (option.id)}
								<label
									class="relative flex size-12 cursor-pointer items-center justify-center rounded-pill"
									title={option.colourName}
								>
									<input
										type="radio"
										name="variantId"
										value={option.id}
										checked={option.id === variantId}
										onchange={() => (variantId = option.id)}
										class="peer sr-only"
									/>
									<span class="sr-only"
										>{option.colourName}{option.inStock ? '' : ` (${m.ui_badge_sold_out()})`}</span
									>
									<span
										class="absolute inset-0.5 rounded-pill border-2 border-transparent peer-checked:border-ink-900 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-400"
									></span>
									<span
										class={[
											'size-9 rounded-pill border border-sand-300',
											!option.inStock && 'opacity-40'
										]}
										style:background-color={option.colourHex}
									></span>
									{#if !option.inStock}
										<span
											aria-hidden="true"
											class="absolute h-0.5 w-9 rotate-45 rounded-pill bg-ink-600"
										></span>
									{/if}
								</label>
							{/each}
						</div>
						{#if variant && !variant.inStock}
							<p
								class="m-0 flex items-center gap-1.5 self-start rounded-pill bg-warning-50 px-3 py-1 text-sm font-semibold text-warning-700"
							>
								<Icon name="alert" size={18} />{m.product_sold_out_colour()}
							</p>
						{/if}
					</fieldset>
				{/if}

				<div class="flex flex-col gap-3">
					<span class="font-semibold">{m.ui_quantity()}</span>
					<div class="flex gap-3">
						<QuantityStepper
							value={quantity}
							max={data.maxQuantity}
							onchange={(value) => (quantity = value)}
						/>
						<input type="hidden" name="quantity" value={quantity} />
						<Button
							type="submit"
							fullWidth
							class="flex-1"
							loading={adding}
							disabled={!variant?.inStock}
						>
							{variant?.inStock ? m.product_add_to_cart() : m.ui_badge_sold_out()}
						</Button>
					</div>
					{#if whatsappHref}
						<Button href={whatsappHref} rel="external" variant="secondary" fullWidth>
							<Icon name="whatsapp" size={22} />{m.product_order_whatsapp()}
						</Button>
					{/if}
				</div>
			</form>

			<section
				aria-label={m.product_delivery()}
				class="flex flex-col gap-3 rounded-lg border border-sand-300 bg-card p-4"
			>
				{#each zones as { label, zone } (label)}
					<div class="flex items-start gap-3">
						<Icon name="truck" class="mt-0.5 text-gold-700" />
						<div>
							<p class="m-0 font-semibold">{label()} · {formatPrice(zone.fee, locale)}</p>
							<p class="m-0 text-sm text-ink-600">
								{m.product_delivery_eta({ min: n(zone.etaDays.min), max: n(zone.etaDays.max) })}
							</p>
						</div>
					</div>
				{/each}
				<div class="flex items-start gap-3">
					<Icon name="exchange" class="mt-0.5 text-gold-700" />
					<div>
						<p class="m-0 font-semibold">{m.home_trust_exchange_title()}</p>
						<p class="m-0 text-sm text-ink-600">{m.home_trust_exchange_body()}</p>
					</div>
				</div>
			</section>

			{#if product.description || details.length}
				<section aria-labelledby="details-h" class="flex flex-col gap-3">
					<h2 id="details-h" class={h2}>{m.product_details()}</h2>
					{#if product.description}
						<p class="m-0 whitespace-pre-line">{product.description}</p>
					{/if}
					{#if details.length}
						<dl class="m-0 grid grid-cols-[120px_1fr] gap-x-3 gap-y-2">
							{#each details as row (row.label)}
								<dt class="text-ink-600">{row.label}</dt>
								<dd class="m-0">{row.value}</dd>
							{/each}
						</dl>
					{/if}
				</section>
			{/if}

			{#if product.youtubeVideoId}
				<section aria-labelledby="video-h" class="flex flex-col gap-2">
					<h2 id="video-h" class={h2}>{m.product_video()}</h2>
					<VideoFacade videoId={product.youtubeVideoId} title={product.name} />
					<p class="m-0 text-sm text-ink-600">{m.product_video_note()}</p>
				</section>
			{/if}

			<section aria-labelledby="faq-h" class="flex flex-col">
				<h2 id="faq-h" class={[h2, 'mb-2']}>{m.product_faq_title()}</h2>
				{#each [{ q: m.product_faq_pay_q(), a: m.product_faq_pay_a() }, { q: m.product_faq_delivery_q(), a: m.product_faq_delivery_a( { insideMin: n(DELIVERY_ZONES.inside_dhaka.etaDays.min), insideMax: n(DELIVERY_ZONES.inside_dhaka.etaDays.max), outsideMin: n(DELIVERY_ZONES.outside_dhaka.etaDays.min), outsideMax: n(DELIVERY_ZONES.outside_dhaka.etaDays.max) } ) }] as faq (faq.q)}
					<details class="group border-b border-sand-300">
						<summary
							class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden"
						>
							{faq.q}<Icon
								name="chevron-down"
								size={20}
								class="transition-transform group-open:rotate-180"
							/>
						</summary>
						<p class="m-0 mb-4 text-ink-600">{faq.a}</p>
					</details>
				{/each}
			</section>
		</div>
	</div>

	{#if data.related.length}
		<section aria-labelledby="related-h" class="flex flex-col gap-4 pt-12">
			<h2 id="related-h" class={h2}>{m.product_related()}</h2>
			<ProductGrid products={data.related} />
		</section>
	{/if}
</div>

<!-- Phones: the add button stays in reach while reading the details. -->
{#if variant?.inStock}
	<div
		class="sticky bottom-tabbar z-20 flex items-center gap-3 border-t border-sand-200 bg-card px-gutter py-3 shadow-lg lg:hidden"
	>
		<div class="flex flex-col leading-snug">
			<span class="text-sm text-ink-600">{variant.colourName} · {n(quantity)}</span>
			<span class="text-lg font-semibold">{formatPrice(product.price * quantity, locale)}</span>
		</div>
		<Button type="submit" form="add-form" fullWidth class="flex-1" loading={adding}>
			{m.product_add_to_cart()}
		</Button>
	</div>
{/if}
