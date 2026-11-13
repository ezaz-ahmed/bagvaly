<!-- Dev-only QA page (guarded in +page.server.ts); labels are intentionally not localized. -->
<script lang="ts">
	import {
		Badge,
		Button,
		FilterChip,
		FilterChipRow,
		Icon,
		Price,
		QuantityStepper,
		Select,
		StatusPill,
		TextArea,
		TextField,
		Toast
	} from '#lib/components/ui/index.ts';
	import { iconNames } from '#lib/components/ui/Icon.svelte';
	import ProductGrid from '#lib/components/shop/ProductGrid.svelte';
	import type { ProductCardData } from '#lib/components/shop/product-card.ts';

	let quantity = $state(1);
	let chip = $state('Tote');
	let toast = $state<'success' | 'error' | null>(null);
	const colors = [
		'bg-burgundy-600',
		'bg-burgundy-700',
		'bg-rose-50',
		'bg-ivory-50',
		'bg-sand-200',
		'bg-sand-300',
		'bg-gold-400',
		'bg-gold-700',
		'bg-ink-900',
		'bg-ink-600',
		'bg-success-50',
		'bg-success-700',
		'bg-warning-50',
		'bg-warning-700',
		'bg-error-50',
		'bg-error-700',
		'bg-card'
	];
	// Photos are local only: drop any JPEG at static/dev/sample-bag.jpg (do not commit it).
	const photo = { key: 'dev/sample-bag.jpg', alt: 'Sample bag', width: 800, height: 1000 };
	const card = {
		price: 145_000,
		compareAtPrice: null,
		isNew: false,
		isBestSeller: false,
		inStock: true,
		colourCount: 3,
		image: photo
	};
	const cards: ProductCardData[] = [
		{
			...card,
			slug: 'sold-out',
			name: 'Sold out, on sale',
			inStock: false,
			compareAtPrice: 180_000
		},
		{
			...card,
			slug: 'sale',
			name: 'Sale crossbody with a long name that wraps',
			compareAtPrice: 180_000
		},
		{
			...card,
			slug: 'new',
			name: 'নতুন চামড়ার শোল্ডার ব্যাগ, লম্বা নাম যা দুই লাইনের বেশি জায়গা নেয়',
			isNew: true
		},
		{
			...card,
			slug: 'no-image',
			name: 'Best seller, no photo',
			isBestSeller: true,
			colourCount: 1,
			image: null
		}
	];
	const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-4xl'];
</script>

<svelte:head>
	<title>Tokens</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="mx-auto flex max-w-page flex-col gap-8 px-gutter py-8">
	<h1 class="text-4xl text-primary">Design tokens</h1>

	<section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		{#each colors as color (color)}
			<div class="overflow-hidden rounded-lg border border-sand-300 bg-card shadow-sm">
				<div class="h-16 {color}"></div>
				<p class="p-2 text-sm text-ink-600">{color.slice(3)}</p>
			</div>
		{/each}
	</section>

	<section class="flex flex-col gap-2">
		{#each sizes as size (size)}
			<p class="{size} font-heading">{size} Bagvaly ব্যাগভ্যালি</p>
		{/each}
		<p lang="bn">
			বাংলা লেখা লাইন-হাইট ১.৭ দিয়ে দেখানো হচ্ছে। বাংলা লেখা লাইন-হাইট ১.৭ দিয়ে দেখানো হচ্ছে।
		</p>
		<a href="#top">Link (gold-700, hover burgundy-700)</a>
	</section>

	<section class="flex flex-wrap items-center gap-3">
		<button
			class="min-h-tap rounded-md bg-burgundy-600 px-5 text-ivory-50 transition-colors duration-tap ease-brand hover:bg-burgundy-700"
		>
			Primary
		</button>
		<button
			class="min-h-tap rounded-md border border-burgundy-600 px-5 text-burgundy-600 transition-colors duration-tap ease-brand hover:bg-rose-50"
		>
			Secondary
		</button>
		<button class="min-h-tap rounded-md bg-sand-300 px-5 text-ink-600" disabled>Disabled</button>
		<input class="min-h-tap rounded-sm border-sand-300 bg-card" placeholder="Input" />
		<span class="rounded-pill bg-rose-50 px-3 py-1 text-sm text-burgundy-600">Pill</span>
		<div class="h-header w-32 rounded-lg bg-card shadow-lg"></div>
	</section>

	<h2 class="text-2xl">Primitives</h2>

	<section class="flex flex-wrap items-center gap-3">
		<Button>Add to cart</Button>
		<Button variant="secondary">View details</Button>
		<Button variant="ghost">Remove</Button>
		<Button variant="danger-outline">Cancel order</Button>
		<Button size="lg" href="#top">Link, large</Button>
		<Button loading>Place order</Button>
		<Button disabled>Disabled</Button>
		<Button fullWidth>Full width</Button>
	</section>

	<section class="flex flex-wrap items-center gap-3">
		<Badge tone="new" />
		<Badge tone="sale" />
		<Badge tone="best-seller" />
		<Badge tone="sold-out" />
		<span lang="bn"><Badge tone="best-seller" /></span>
		<StatusPill tone="success">Delivered</StatusPill>
		<StatusPill tone="warning">Pending</StatusPill>
		<StatusPill tone="error">Cancelled</StatusPill>
		<StatusPill>Draft</StatusPill>
	</section>

	<section class="flex flex-wrap items-baseline gap-6">
		<Price amount={145_000} />
		<Price amount={145_000} compareAt={180_000} size="lg" />
		<Price amount={145_000} compareAt={180_000} size="hero" />
	</section>

	<section class="flex flex-wrap gap-4">
		{#each iconNames as name (name)}
			<span class="flex w-20 flex-col items-center gap-1 text-xs text-ink-600">
				<Icon {name} class="text-ink-900" />{name}
			</span>
		{/each}
	</section>

	<section class="grid max-w-md gap-4">
		<TextField label="Full name" autocomplete="name" />
		<TextField
			label="Mobile number"
			type="tel"
			hint="11 digits, starting 01"
			error="Enter 11 digits, starting 01"
		/>
		<Select
			label="District"
			options={[
				{ value: '', label: 'Choose a district' },
				{ value: 'dhaka', label: 'Dhaka' }
			]}
		/>
		<TextArea label="Order notes" optional />
	</section>

	<ProductGrid products={cards} priorityCount={2} showColours />

	<section class="flex flex-col gap-4">
		<QuantityStepper bind:value={quantity} max={3} />
		<FilterChipRow label="Category">
			{#each ['Shoulder', 'Crossbody', 'Tote', 'Clutch', 'Backpack', 'Wallet', 'Mini'] as c (c)}
				<FilterChip selected={chip === c} onclick={() => (chip = c)}>{c}</FilterChip>
			{/each}
		</FilterChipRow>
		<div class="flex gap-3">
			<Button variant="secondary" onclick={() => (toast = 'success')}>Success toast</Button>
			<Button variant="secondary" onclick={() => (toast = 'error')}>Error toast</Button>
		</div>
		{#if toast}
			<Toast tone={toast} ondismiss={() => (toast = null)}>
				{toast === 'error' ? 'Could not add to cart.' : 'Added to cart.'}
			</Toast>
		{/if}
	</section>
</main>
