<script lang="ts">
	import type { Path } from '$app/types';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { refreshCartBadge } from '#lib/cart-badge.svelte.ts';
	import { DELIVERY_ZONES } from '#lib/delivery.ts';
	import { formatPrice, numberLocale } from '#lib/money.ts';
	import { Button, Icon } from '#lib/components/ui/index.ts';
	import ProductImage from '#lib/components/shop/ProductImage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = getLocale();
	const n = new Intl.NumberFormat(numberLocale(locale)).format;
	const price = (poisha: number) => formatPrice(poisha, locale);
	const cart = $derived(data.cart);
	const insideFee = DELIVERY_ZONES.inside_dhaka.fee;

	let busy = $state<number | null>(null);
	const submit: SubmitFunction = ({ formData }) => {
		busy = Number(formData.get('variantId'));
		return async ({ update }) => {
			await update();
			refreshCartBadge();
			busy = null;
		};
	};

	const shopHref = resolve(localizeHref('/shop') as Path);
	const stepButton =
		'grid size-tap place-items-center rounded-md text-ink-900 disabled:cursor-not-allowed disabled:text-sand-300';
</script>

<svelte:head>
	<title>{m.cart_meta_title()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto flex max-w-page flex-col px-gutter pt-6 pb-8 lg:pt-10">
	<h1 class="m-0 text-4xl leading-[1.15] font-semibold tracking-[-0.005em]">
		{m.cart_title()}
		{#if cart.count}
			<span class="font-body text-base font-medium text-ink-600"
				>{m.cart_item_count({ count: cart.count, countText: n(cart.count) })}</span
			>
		{/if}
	</h1>

	{#if cart.lines.length === 0}
		<section class="flex flex-col items-center gap-4 py-16 text-center">
			<span class="flex size-22 items-center justify-center rounded-pill bg-sand-200 text-gold-700"
				><Icon name="bag" size={40} /></span
			>
			<h2 class="m-0 text-[28px] leading-[1.15] font-semibold">{m.cart_empty_title()}</h2>
			<p class="m-0 text-ink-600">{m.cart_empty_body()}</p>
			<Button href={shopHref}>{m.cart_shop_bags()}</Button>
		</section>
	{:else}
		<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
			<section aria-label={m.cart_items()} class="flex flex-col">
				{#each cart.lines as line (line.variantId)}
					<div class="flex gap-3 border-b border-sand-200 py-4">
						<a
							href={resolve(localizeHref(`/bags/${line.slug}`) as Path)}
							class="w-22 shrink-0 overflow-hidden rounded-md"
						>
							<ProductImage image={line.image} alt={line.image?.alt ?? line.name} sizes="88px" />
						</a>
						<div class="flex min-w-0 flex-1 flex-col gap-1">
							<div class="flex justify-between gap-2">
								<a
									href={resolve(localizeHref(`/bags/${line.slug}`) as Path)}
									class="text-lg leading-snug font-medium text-ink-900 no-underline">{line.name}</a
								>
								<span class="font-semibold whitespace-nowrap">{price(line.lineTotal)}</span>
							</div>
							<span class="text-sm text-ink-600"
								>{line.colourName} · {m.cart_each({ price: price(line.price) })}</span
							>
							{#if line.problem}
								<p class="m-0 flex items-center gap-1 text-sm font-medium text-error-700">
									<Icon name="alert" size={18} />
									{line.problem === 'sold_out' ? m.cart_sold_out() : m.cart_short()}
								</p>
							{/if}
							<form
								method="POST"
								action="?/update"
								use:enhance={submit}
								class="mt-1 flex items-center justify-between"
							>
								<input type="hidden" name="variantId" value={line.variantId} />
								{#if line.problem === 'sold_out'}
									<span></span>
								{:else}
									<div
										role="group"
										aria-label={m.cart_quantity_for({ name: line.name })}
										class="inline-flex items-center rounded-md border-[1.5px] border-sand-300 bg-card"
									>
										<button
											name="quantity"
											value={line.quantity - 1}
											disabled={line.quantity <= 1 || busy === line.variantId}
											aria-label={m.ui_quantity_decrease()}
											class={stepButton}><Icon name="minus" /></button
										>
										<output class="min-w-7 text-center font-semibold" aria-live="polite"
											>{n(line.quantity)}</output
										>
										<button
											name="quantity"
											value={line.quantity + 1}
											disabled={line.quantity >= line.maxQuantity || busy === line.variantId}
											aria-label={m.ui_quantity_increase()}
											class={stepButton}><Icon name="plus" /></button
										>
									</div>
								{/if}
								<button
									formaction="?/remove"
									disabled={busy === line.variantId}
									class="min-h-tap px-2 text-sm font-medium text-ink-600 underline"
									>{m.cart_remove()}</button
								>
							</form>
						</div>
					</div>
				{/each}
			</section>

			<div class="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start lg:pt-4">
				<section
					aria-labelledby="sum-h"
					class="flex flex-col gap-2.5 rounded-lg border border-sand-300 bg-card px-4 py-5"
				>
					<h2 id="sum-h" class="m-0 mb-1 text-[22px] leading-[1.15] font-semibold">
						{m.cart_summary()}
					</h2>
					<div class="flex justify-between">
						<span>{m.cart_subtotal()}</span><span>{price(cart.subtotal)}</span>
					</div>
					<div class="flex justify-between">
						<span
							>{m.cart_delivery()}
							<span class="text-sm text-ink-600">{m.cart_inside_dhaka()}</span></span
						><span>{price(insideFee)}</span>
					</div>
					<p class="m-0 text-sm text-ink-600">
						{m.cart_outside_note({ fee: price(DELIVERY_ZONES.outside_dhaka.fee) })}
					</p>
					<div class="mt-1 flex justify-between border-t border-ink-900 pt-3 text-lg font-semibold">
						<span>{m.cart_total()}</span><span>{price(cart.subtotal + insideFee)}</span>
					</div>
				</section>

				<p
					class="m-0 flex items-center gap-3 rounded-md bg-rose-50 px-4 py-3 font-medium text-burgundy-600"
				>
					<Icon name="cash" />{m.cart_cod_note()}
				</p>

				<div
					class="sticky bottom-tabbar -mx-gutter flex flex-col gap-2 rounded-t-lg bg-card px-gutter pt-4 pb-5 shadow-lg lg:static lg:mx-0 lg:rounded-lg lg:shadow-none"
				>
					{#if cart.hasProblem}
						<p class="m-0 text-center text-sm text-error-700">{m.cart_fix_problems()}</p>
					{/if}
					<Button
						href={resolve(localizeHref('/checkout') as Path)}
						size="lg"
						fullWidth
						disabled={cart.hasProblem}
					>
						{m.cart_checkout({ total: price(cart.subtotal + insideFee) })}
					</Button>
					<a
						href={shopHref}
						class="flex min-h-11 items-center justify-center text-sm font-semibold no-underline"
						>{m.cart_continue()}</a
					>
				</div>
			</div>
		</div>
	{/if}
</div>
