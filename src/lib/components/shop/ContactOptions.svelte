<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { contact, socialLinks } from '#lib/config.ts';
	import { Button, Icon } from '#lib/components/ui/index.ts';

	interface Props {
		/** Prefilled WhatsApp message. */
		whatsappText?: string;
	}

	let { whatsappText }: Props = $props();

	// Only channels with a real value from config.ts are shown; placeholders never ship.
	const socials = socialLinks.filter((link) => link.url);
	const whatsappHref = $derived(
		contact.whatsapp
			? `https://wa.me/${contact.whatsapp}${whatsappText ? `?text=${encodeURIComponent(whatsappText)}` : ''}`
			: null
	);
</script>

{#if whatsappHref || contact.phone || socials.length}
	<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
		{#if whatsappHref}
			<Button href={whatsappHref} rel="external">
				<Icon name="whatsapp" size={22} />{m.layout_whatsapp()}
			</Button>
		{/if}
		{#if contact.phone}
			<Button href="tel:{contact.phone}" rel="external" variant="secondary">
				<Icon name="phone" size={20} />{m.layout_call({ phone: contact.phone })}
			</Button>
		{/if}
		{#each socials as social (social.name)}
			<Button href={social.url} rel="external" variant="ghost">
				{social.name}<Icon name="external" size={18} />
			</Button>
		{/each}
	</div>
{:else}
	<p class="m-0 text-ink-600">{m.help_contact_soon()}</p>
{/if}
