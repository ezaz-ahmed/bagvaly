<!-- Dev-only QA page (guarded in +page.server.ts); labels are intentionally not localized. -->
<script lang="ts">
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
</main>
