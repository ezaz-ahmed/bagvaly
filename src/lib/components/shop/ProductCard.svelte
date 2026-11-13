<script lang="ts">
	import type { Path } from '$app/types';
	import { resolve } from '$app/paths';
	import { Badge, Price } from '#lib/components/ui/index.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import ProductImage from './ProductImage.svelte';
	import { cardBadge, type ProductCardData } from './product-card';

	interface Props {
		product: ProductCardData;
		/** Shop page: show "N colours" under the price. */
		showColours?: boolean;
		priority?: boolean;
		/** Matches ProductGrid: 2 / 3 / 4 columns inside the 1200px page. */
		sizes?: string;
	}

	let {
		product,
		showColours = false,
		priority = false,
		sizes = '(min-width: 64rem) 300px, (min-width: 48rem) 33vw, 50vw'
	}: Props = $props();

	const badge = $derived(cardBadge(product));
	const soldOut = $derived(badge === 'sold-out');
</script>

<a
	href={resolve(localizeHref(`/bags/${product.slug}`) as Path)}
	class="flex h-full flex-col overflow-hidden rounded-lg bg-card text-ink-900 no-underline shadow-sm transition duration-panel ease-brand hover:text-ink-900 md:hover:shadow-md motion-safe:md:hover:-translate-y-0.5"
>
	<div class="relative">
		<ProductImage
			image={product.image}
			alt={product.image?.alt ?? ''}
			{sizes}
			{priority}
			class={soldOut ? 'opacity-60' : undefined}
		/>
		{#if badge}
			<span class="absolute top-2 left-2"><Badge tone={badge} /></span>
		{/if}
	</div>
	<div class="flex flex-col gap-1 p-3">
		<!-- Bangla gets one more line at its taller line-height, so it never shows less of the name. -->
		<h3
			class="line-clamp-2 font-body text-lg leading-snug font-medium [&:lang(bn)]:line-clamp-3 [&:lang(bn)]:leading-[1.7]"
		>
			{product.name}
		</h3>
		<Price amount={product.price} compareAt={product.compareAtPrice} />
		<!-- Only 2+ colours are listed, so the message never needs a singular form. -->
		{#if showColours && product.colourCount > 1}
			<p class="text-sm text-ink-600">
				{m.shop_colour_count({
					count: new Intl.NumberFormat(getLocale() === 'bn' ? 'bn-BD' : 'en-US').format(
						product.colourCount
					)
				})}
			</p>
		{/if}
	</div>
</a>
