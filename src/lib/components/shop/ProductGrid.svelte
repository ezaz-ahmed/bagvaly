<script lang="ts">
	import ProductCard from './ProductCard.svelte';
	import type { ProductCardData } from './product-card';

	interface Props {
		products: ProductCardData[];
		/** How many leading cards are above the fold and load their image eagerly. */
		priorityCount?: number;
		showColours?: boolean;
	}

	let { products, priorityCount = 0, showColours = false }: Props = $props();
</script>

<ul class="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
	{#each products as product, i (product.slug)}
		<li><ProductCard {product} {showColours} priority={i < priorityCount} /></li>
	{/each}
</ul>
