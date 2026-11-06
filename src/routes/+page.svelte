<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.site_name()}</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 px-4">
	<h1 class="text-4xl text-primary">{m.site_name()}</h1>
	<p>{m.home_tagline()}</p>
</main>
