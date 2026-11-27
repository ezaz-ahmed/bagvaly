<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { numberLocale } from '#lib/money.ts';
	import ContactOptions from '#lib/components/shop/ContactOptions.svelte';

	const steps = [m.order_step_call, m.order_step_courier, m.order_step_pay];
	const n = new Intl.NumberFormat(numberLocale(getLocale())).format;
</script>

<svelte:head>
	<title>{m.help_track_meta_title()}</title>
	<meta name="description" content={m.help_track_intro()} />
</svelte:head>

<!-- shortcut: no self-service lookup; showing order status by phone needs an OTP check first, so
     shoppers ask us instead. Build a lookup once phone OTP (SMS gateway) is live. -->
<div class="mx-auto flex max-w-2xl flex-col gap-6 px-gutter pt-8 pb-16 lg:pt-12">
	<h1 class="m-0 text-4xl leading-[1.15] font-semibold tracking-[-0.005em]">
		{m.layout_track_order()}
	</h1>
	<p class="m-0 text-lg text-ink-600">{m.help_track_intro()}</p>
	<ContactOptions whatsappText={m.help_track_whatsapp_text()} />

	<section aria-labelledby="steps-h" class="flex flex-col gap-4 pt-4">
		<h2 id="steps-h" class="m-0 text-[22px] leading-[1.15] font-semibold">
			{m.help_track_steps_title()}
		</h2>
		<ol class="m-0 flex list-none flex-col gap-3.5 p-0">
			{#each steps as step, i (i)}
				<li class="flex gap-3">
					<span
						class="flex size-7 shrink-0 items-center justify-center rounded-pill bg-rose-50 text-sm font-semibold text-burgundy-600"
						>{n(i + 1)}</span
					><span>{step()}</span>
				</li>
			{/each}
		</ol>
	</section>
</div>
