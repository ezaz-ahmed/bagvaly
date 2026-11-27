<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { DELIVERY_ZONES } from '#lib/delivery.ts';
	import { formatPrice, numberLocale } from '#lib/money.ts';
	import { Icon } from '#lib/components/ui/index.ts';
	import ContactOptions from '#lib/components/shop/ContactOptions.svelte';

	const locale = getLocale();
	const n = new Intl.NumberFormat(numberLocale(locale)).format;
	const zones = [
		{ label: m.product_delivery_inside, zone: DELIVERY_ZONES.inside_dhaka },
		{ label: m.product_delivery_outside, zone: DELIVERY_ZONES.outside_dhaka }
	];
	const h2 = 'm-0 text-[22px] leading-[1.15] font-semibold';
</script>

<svelte:head>
	<title>{m.help_delivery_meta_title()}</title>
	<meta name="description" content={m.help_delivery_intro()} />
</svelte:head>

<div class="mx-auto flex max-w-2xl flex-col gap-8 px-gutter pt-8 pb-16 lg:pt-12">
	<div class="flex flex-col gap-3">
		<h1 class="m-0 text-4xl leading-[1.15] font-semibold tracking-[-0.005em]">
			{m.layout_delivery_exchange()}
		</h1>
		<p class="m-0 text-lg text-ink-600">{m.help_delivery_intro()}</p>
	</div>

	<section aria-labelledby="fees-h" class="flex flex-col gap-3">
		<h2 id="fees-h" class={h2}>{m.help_delivery_fees_title()}</h2>
		<div class="flex flex-col gap-3 rounded-lg border border-sand-300 bg-card p-4">
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
		</div>
		<p class="m-0 text-ink-600">{m.help_delivery_zone_note()}</p>
	</section>

	<section aria-labelledby="cod-h" class="flex flex-col gap-2">
		<h2 id="cod-h" class={h2}>{m.home_trust_cod_title()}</h2>
		<p class="m-0">{m.help_delivery_cod_body()}</p>
	</section>

	<section aria-labelledby="exchange-h" class="flex flex-col gap-2">
		<h2 id="exchange-h" class={h2}>{m.home_trust_exchange_title()}</h2>
		<p class="m-0">{m.help_delivery_exchange_body()}</p>
	</section>

	<section aria-labelledby="help-h" class="flex flex-col gap-3">
		<h2 id="help-h" class={h2}>{m.home_help_title()}</h2>
		<ContactOptions />
	</section>
</div>
