<script lang="ts">
	import type { Path } from '$app/types';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { contact } from '#lib/config.ts';
	import { DELIVERY_ZONES, zoneForDistrict } from '#lib/delivery.ts';
	import { formatPrice, numberLocale } from '#lib/money.ts';
	import { Button, Icon, Select, TextArea, TextField } from '#lib/components/ui/index.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const locale = getLocale();
	const n = new Intl.NumberFormat(numberLocale(locale)).format;
	const price = (poisha: number) => formatPrice(poisha, locale);
	const cart = $derived(data.cart);

	// svelte-ignore state_referenced_locally
	let districtId = $state(form?.values.districtId ?? '');
	const zone = $derived(zoneForDistrict(districtId));
	const fee = $derived(zone ? DELIVERY_ZONES[zone].fee : null);
	const errors = $derived(new Set<string>(form?.errors ?? []));
	let placing = $state(false);

	const errorText = {
		name: m.checkout_error_name,
		phone: m.checkout_error_phone,
		districtId: m.checkout_error_district,
		address: m.checkout_error_address,
		areaLandmark: m.checkout_error_too_long,
		note: m.checkout_error_too_long
	};
	const err = (field: keyof typeof errorText) =>
		errors.has(field) ? errorText[field]() : undefined;
	const value = (field: keyof typeof errorText) => form?.values[field] ?? '';
</script>

<svelte:head>
	<title>{m.checkout_meta_title()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto flex max-w-page flex-col pb-8 lg:px-gutter lg:pt-10">
	<details class="group border-b border-sand-200 bg-card lg:hidden">
		<summary
			class="flex min-h-14 cursor-pointer list-none items-center justify-between px-gutter [&::-webkit-details-marker]:hidden"
		>
			<span class="flex items-center gap-2 font-medium">
				<Icon name="bag" size={20} />{m.checkout_items_toggle({
					count: cart.count,
					countText: n(cart.count)
				})}
				<Icon name="chevron-down" size={18} class="transition-transform group-open:rotate-180" />
			</span>
			<span class="font-semibold">{price(cart.subtotal + (fee ?? 0))}</span>
		</summary>
		<ul class="m-0 flex list-none flex-col gap-2 px-gutter pb-4 text-sm">
			{#each cart.lines as line (line.variantId)}
				<li class="flex justify-between gap-3">
					<span>{line.name} · {line.colourName} × {n(line.quantity)}</span>
					<span class="whitespace-nowrap">{price(line.lineTotal)}</span>
				</li>
			{/each}
		</ul>
	</details>

	<div class="flex flex-col gap-1 px-gutter pt-6 lg:px-0 lg:pt-0">
		<h1 class="m-0 text-4xl leading-[1.15] font-semibold tracking-[-0.005em]">
			{m.checkout_title()}
		</h1>
		<p class="m-0 text-ink-600">{m.checkout_intro()}</p>
	</div>

	{#if form?.formError}
		<div
			role="alert"
			class="mx-gutter mt-6 flex items-start gap-3 rounded-md bg-error-50 px-4 py-3 text-ink-900 lg:mx-0"
		>
			<Icon name="alert" class="mt-0.5 text-error-700" />
			<p class="m-0">
				{#if form.formError === 'blocked'}
					{m.checkout_error_blocked()}
					{#if contact.phone}<a href="tel:{contact.phone}">{contact.phone}</a>{/if}
				{:else}
					{m.checkout_error_stock()}
					<a href={resolve(localizeHref('/cart') as Path)}>{m.checkout_back_to_cart()}</a>
				{/if}
			</p>
		</div>
	{/if}

	<form
		method="POST"
		class="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_380px]"
		use:enhance={() => {
			placing = true;
			return async ({ update }) => {
				await update({ reset: false });
				placing = false;
			};
		}}
	>
		<input type="hidden" name="idempotencyKey" value={data.idempotencyKey} />

		<div class="flex flex-col">
			<fieldset class="m-0 flex flex-col gap-4 border-0 p-0 px-gutter lg:px-0">
				<legend class="mb-4 p-0 pt-8 font-heading text-[22px] leading-[1.15] font-semibold"
					>{m.checkout_delivery_details()}</legend
				>
				<TextField
					label={m.checkout_name()}
					name="name"
					autocomplete="name"
					required
					maxlength={80}
					value={value('name')}
					error={err('name')}
				/>
				<TextField
					label={m.checkout_phone()}
					name="phone"
					type="tel"
					inputmode="tel"
					autocomplete="tel-national"
					placeholder="01XXXXXXXXX"
					required
					maxlength={20}
					value={value('phone')}
					hint={m.checkout_phone_hint()}
					error={err('phone')}
				/>
				<TextArea
					label={m.checkout_address()}
					name="address"
					autocomplete="street-address"
					rows={3}
					required
					maxlength={300}
					placeholder={m.checkout_address_placeholder()}
					value={value('address')}
					error={err('address')}
				/>
				<Select
					label={m.checkout_district()}
					name="districtId"
					autocomplete="address-level2"
					required
					bind:value={districtId}
					options={[{ value: '', label: m.checkout_district_choose() }, ...data.districts]}
					hint={zone
						? m.checkout_district_hint({
								fee: price(DELIVERY_ZONES[zone].fee),
								min: n(DELIVERY_ZONES[zone].etaDays.min),
								max: n(DELIVERY_ZONES[zone].etaDays.max)
							})
						: undefined}
					error={err('districtId')}
				/>
				<TextField
					label={m.checkout_area()}
					name="areaLandmark"
					autocomplete="address-level3"
					optional
					maxlength={120}
					placeholder={m.checkout_area_placeholder()}
					value={value('areaLandmark')}
					error={err('areaLandmark')}
				/>
				<TextArea
					label={m.checkout_note()}
					name="note"
					rows={2}
					optional
					maxlength={500}
					placeholder={m.checkout_note_placeholder()}
					value={value('note')}
					error={err('note')}
				/>
			</fieldset>

			<fieldset class="m-0 flex flex-col gap-3 border-0 p-0 px-gutter lg:px-0">
				<legend class="mb-3 p-0 pt-8 font-heading text-[22px] leading-[1.15] font-semibold"
					>{m.checkout_payment()}</legend
				>
				<label
					class="flex cursor-pointer items-start gap-3 rounded-md border-[1.5px] border-burgundy-600 bg-rose-50 p-4"
				>
					<input
						type="radio"
						name="payment"
						value="cod"
						checked
						class="mt-0.5 size-5 text-burgundy-600 focus:ring-gold-400"
					/>
					<span class="flex flex-col">
						<span class="font-semibold text-burgundy-600">{m.home_trust_cod_title()}</span>
						<span>{m.home_trust_cod_body()}</span>
					</span>
				</label>
			</fieldset>
		</div>

		<div
			class="flex flex-col gap-6 px-gutter pt-8 lg:sticky lg:top-24 lg:self-start lg:px-0 lg:pt-0"
		>
			<section
				aria-labelledby="co-sum"
				class="flex flex-col gap-2.5 rounded-lg border border-sand-300 bg-card px-4 py-5"
			>
				<h2 id="co-sum" class="m-0 mb-1 text-[22px] leading-[1.15] font-semibold">
					{m.cart_summary()}
				</h2>
				<ul
					class="m-0 hidden list-none flex-col gap-2 border-b border-sand-200 pb-3 text-sm lg:flex"
				>
					{#each cart.lines as line (line.variantId)}
						<li class="flex justify-between gap-3">
							<span>{line.name} · {line.colourName} × {n(line.quantity)}</span>
							<span class="whitespace-nowrap">{price(line.lineTotal)}</span>
						</li>
					{/each}
				</ul>
				<div class="flex justify-between">
					<span>{m.checkout_subtotal({ count: cart.count, countText: n(cart.count) })}</span><span
						>{price(cart.subtotal)}</span
					>
				</div>
				<div class="flex justify-between">
					<span
						>{m.cart_delivery()}
						{#if zone}<span class="text-sm text-ink-600"
								>{zone === 'inside_dhaka'
									? m.cart_inside_dhaka()
									: m.checkout_outside_dhaka()}</span
							>{/if}</span
					>
					<span>{fee === null ? m.checkout_fee_pending() : price(fee)}</span>
				</div>
				<div class="mt-1 flex justify-between border-t border-ink-900 pt-3 text-lg font-semibold">
					<span>{m.checkout_pay_on_delivery()}</span><span>{price(cart.subtotal + (fee ?? 0))}</span
					>
				</div>
			</section>

			<div class="flex flex-col gap-3">
				<Button type="submit" size="lg" fullWidth loading={placing}>
					{m.checkout_place_order({ total: price(cart.subtotal + (fee ?? 0)) })}
				</Button>
				<p class="m-0 text-center text-sm text-ink-600">{m.checkout_call_note()}</p>
			</div>
		</div>
	</form>
</div>
