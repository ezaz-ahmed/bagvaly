<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { imageSrcset, imageUrl } from '#lib/images.ts';

	interface Props {
		/** R2 object and its stored size; null renders the sand placeholder (product without photos). */
		image: { key: string; width: number; height: number } | null;
		alt: string;
		/** Rendered width hint for `srcset`. */
		sizes?: string;
		/** Above the fold: load eagerly with high fetch priority. */
		priority?: boolean;
		class?: string;
	}

	let { image, alt, sizes = '100vw', priority = false, class: className }: Props = $props();

	// SSR renders the image visible, so it shows without JS or when it loaded before hydration;
	// only an image still loading once hydrated is hidden, then fades in on load.
	let pending = $state(false);
	const fadeIn: Attachment<HTMLImageElement> = (img) => {
		if (!img.complete) pending = true;
	};
</script>

<div class={['aspect-[4/5] overflow-hidden bg-sand-200', className]}>
	<!-- No photo: nothing to describe, so the empty box stays out of the accessibility tree. -->
	{#if image}
		<img
			src={imageUrl(image.key, 800)}
			srcset={imageSrcset(image.key)}
			{sizes}
			{alt}
			width={image.width}
			height={image.height}
			loading={priority ? 'eager' : 'lazy'}
			fetchpriority={priority ? 'high' : undefined}
			decoding={priority ? undefined : 'async'}
			class={[
				'size-full object-cover transition-opacity duration-page ease-brand',
				pending && 'opacity-0'
			]}
			onload={() => (pending = false)}
			onerror={() => (pending = false)}
			{@attach fadeIn}
		/>
	{/if}
</div>
