<script lang="ts" module>
	// Paths copied from the page designs (docs/design/*.dc.html); circles and rects are written as
	// arcs so every icon is a single path.
	const icons = {
		menu: 'M4 7h16M4 12h16M4 17h16',
		home: 'M4 10.5L12 4l8 6.5V20h-5.5v-6h-5v6H4z',
		search: 'M4.5 11a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M20 20l-4.2-4.2',
		heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
		bag: 'M6 8h12l-1 12H7L6 8zM9 8V7a3 3 0 0 1 6 0v1',
		'chevron-left': 'M15 6l-6 6 6 6',
		'chevron-right': 'M9 6l6 6-6 6',
		'chevron-down': 'M6 9l6 6 6-6',
		'arrow-right': 'M5 12h14M13 6l6 6-6 6',
		plus: 'M12 5v14M5 12h14',
		minus: 'M5 12h14',
		close: 'M6 6l12 12M18 6L6 18',
		cash: 'M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM9.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
		truck:
			'M3 6h11v10H3zM14 9h4l3 3.5V16h-7M5.75 17.5a1.75 1.75 0 1 0 3.5 0a1.75 1.75 0 1 0-3.5 0M15.75 17.5a1.75 1.75 0 1 0 3.5 0a1.75 1.75 0 1 0-3.5 0',
		exchange: 'M4 9h13l-3-3M20 15H7l3 3',
		whatsapp: 'M4 20l1.3-3.9A8 8 0 1 1 8 19z',
		phone:
			'M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z',
		info: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 11v5M12 8h.01',
		alert: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7.5v5M12 16h.01',
		check: 'M5 12.5l4.5 4.5L19 7',
		grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
		box: 'M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10',
		users:
			'M5.5 8a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M17 14a6 6 0 0 1 4 6',
		sliders:
			'M4 7h10M18 7h2M4 17h4M12 17h8M14 7a2 2 0 1 0 4 0a2 2 0 1 0-4 0M8 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
		printer: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z',
		external: 'M7 17L17 7M9 7h8v8'
	};

	export type IconName = keyof typeof icons;
	export const iconNames = Object.keys(icons) as IconName[];
</script>

<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		name: IconName;
		size?: number;
		/** Accessible name; without it the icon is decorative and hidden from screen readers. */
		label?: string;
		class?: ClassValue;
	}

	let { name, size = 24, label, class: className }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={['shrink-0', className]}
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<path d={icons[name]} />
</svg>
