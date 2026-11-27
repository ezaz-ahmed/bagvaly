<script lang="ts">
	import type { Path } from '$app/types';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { contact } from '#lib/config.ts';
	import { formatPrice, numberLocale } from '#lib/money.ts';
	import { Button, Icon } from '#lib/components/ui/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = getLocale();
	const n = new Intl.NumberFormat(numberLocale(locale)).format;
	const price = (poisha: number) => formatPrice(poisha, locale);
	const order = $derived(data.order);
	const steps = [m.order_step_call, m.order_step_courier, m.order_step_pay];
	const whatsappHref = $derived(
		contact.whatsapp
			? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(m.order_whatsapp_text({ number: order.number }))}`
			: null
	);
</script>

<svelte:head>
	<title>{m.order_meta_title()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto flex max-w-xl flex-col px-gutter pt-10 pb-12">
	<section class="flex flex-col items-center gap-3 pb-6 text-center">
		<span
			class="flex size-18 items-center justify-center rounded-pill bg-success-50 text-success-700"
			><Icon name="check" size={36} /></span
		>
		<span
			class="text-xs leading-snug font-semibold tracking-[.12em] text-success-700 uppercase [&:lang(bn)]:tracking-normal"
			>{m.order_placed()}</span
		>
		<h1 class="m-0 text-4xl leading-[1.15] font-semibold tracking-[-0.005em]">
			{m.order_title()}
		</h1>
		<p class="m-0 text-ink-600">
			{m.order_call_note_before()}
			<strong class="font-semibold text-ink-900">{order.phone}</strong>
			{m.order_call_note_after()}
		</p>
	</section>

	<section class="flex flex-col gap-3.5 rounded-lg border border-sand-300 bg-card px-4 py-5">
		<div class="flex items-baseline justify-between gap-3">
			<span class="text-ink-600">{m.order_number()}</span>
			<span class="text-lg font-semibold tracking-[.04em]">#{order.number}</span>
		</div>
		<div class="flex items-baseline justify-between gap-3">
			<span class="text-ink-600">{m.cart_delivery()}</span>
			<span class="text-right font-semibold"
				>{m.order_delivery_value({
					min: n(order.eta.min),
					max: n(order.eta.max),
					district: order.district
				})}</span
			>
		</div>
		<div class="flex items-baseline justify-between gap-3">
			<span class="text-ink-600">{m.order_payment()}</span>
			<span class="font-semibold">{m.home_trust_cod_title()}</span>
		</div>
		<ul class="m-0 flex list-none flex-col gap-1.5 border-t border-sand-200 p-0 pt-3.5 text-sm">
			{#each order.items as item, i (i)}
				<li class="flex justify-between gap-3">
					<span>{item.name} · {item.colour} × {n(item.quantity)}</span>
					<span class="whitespace-nowrap">{price(item.lineTotal)}</span>
				</li>
			{/each}
			<li class="flex justify-between gap-3">
				<span>{m.cart_delivery()}</span><span>{price(order.deliveryFee)}</span>
			</li>
		</ul>
		<div class="flex justify-between border-t border-ink-900 pt-3 text-lg font-semibold">
			<span>{m.order_pay_rider()}</span><span>{price(order.total)}</span>
		</div>
	</section>

	<section aria-labelledby="next-h" class="flex flex-col gap-4 pt-8">
		<h2 id="next-h" class="m-0 text-[22px] leading-[1.15] font-semibold">{m.order_next()}</h2>
		<ol class="m-0 flex list-none flex-col gap-3.5 p-0">
			{#each steps as step, i (i)}
				<li class="flex gap-3">
					<span
						class={[
							'flex size-7 shrink-0 items-center justify-center rounded-pill text-sm font-semibold',
							i === 0 ? 'bg-burgundy-600 text-ivory-50' : 'bg-rose-50 text-burgundy-600'
						]}>{n(i + 1)}</span
					><span>{step()}</span>
				</li>
			{/each}
		</ol>
	</section>

	<section class="flex flex-col gap-3 pt-8">
		{#if whatsappHref}
			<Button href={whatsappHref} rel="external" variant="secondary">
				<Icon name="whatsapp" size={22} />{m.layout_whatsapp()}
			</Button>
		{/if}
		<a
			href={resolve(localizeHref('/shop') as Path)}
			class="flex min-h-tap items-center justify-center font-semibold no-underline"
			>{m.cart_continue()}</a
		>
	</section>
</div>
