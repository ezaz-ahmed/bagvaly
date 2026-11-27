<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';

	interface Props {
		/** YouTube video ID, validated on save (youtubeVideoIdSchema). */
		videoId: string;
		title: string;
	}

	let { videoId, title }: Props = $props();

	// Nothing from YouTube loads until the shopper taps play (AGENTS.md section 10); the lazy
	// thumbnail is the only request before that, and only when scrolled near.
	let playing = $state(false);
</script>

<div class="relative aspect-video w-full overflow-hidden rounded-lg bg-ink-900">
	{#if playing}
		<iframe
			src="https://www.youtube-nocookie.com/embed/{encodeURIComponent(videoId)}?autoplay=1&rel=0"
			{title}
			allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
			class="absolute inset-0 size-full border-0"
		></iframe>
	{:else}
		<button
			type="button"
			class="group absolute inset-0 flex size-full items-center justify-center"
			onclick={() => (playing = true)}
		>
			<img
				src="https://i.ytimg.com/vi/{encodeURIComponent(videoId)}/hqdefault.jpg"
				alt=""
				loading="lazy"
				decoding="async"
				width="480"
				height="360"
				class="absolute inset-0 size-full object-cover opacity-80"
			/>
			<span
				class="relative flex size-16 items-center justify-center rounded-pill bg-burgundy-600 text-ivory-50 transition-colors duration-tap group-hover:bg-burgundy-700"
			>
				<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
					><path d="M9 7l8 5-8 5z" /></svg
				>
				<span class="sr-only">{m.product_video_play({ name: title })}</span>
			</span>
		</button>
	{/if}
</div>
