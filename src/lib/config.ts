import { m } from '#lib/paraglide/messages.js';

/**
 * Shop categories for navigation, linked as `/shop?category=<slug>`.
 * shortcut: static list, replace with the catalog query once #62 lands.
 */
export const categories = [
	{ slug: 'shoulder', label: m.layout_category_shoulder },
	{ slug: 'tote', label: m.layout_category_tote },
	{ slug: 'crossbody', label: m.layout_category_crossbody },
	{ slug: 'top-handle', label: m.layout_category_top_handle },
	{ slug: 'clutch', label: m.layout_category_clutch },
	{ slug: 'backpack', label: m.layout_category_backpack }
];

/**
 * Home page "Shop by occasion" cards. Occasions are not modelled in the catalogue, so each links to
 * the category that best fits it.
 * shortcut: fixed category per occasion, replace with an occasion tag if the owner wants mixed picks.
 */
export const occasions = [
	{ category: 'tote', label: m.home_occasion_office },
	{ category: 'crossbody', label: m.home_occasion_everyday },
	{ category: 'clutch', label: m.home_occasion_festive }
];

/** Help pages; they 404 until their own issues build them. */
export const helpLinks = [
	{ path: '/track', label: m.layout_track_order },
	{ path: '/delivery', label: m.layout_delivery_exchange },
	{ path: '/contact', label: m.layout_contact_us }
];

// Real values still to come from the owner. Components hide any item whose value is empty.
export const contact = {
	/** Local display form, e.g. `01XXX-XXXXXX`; dialled as written. */
	phone: '',
	/** International digits only, e.g. `8801XXXXXXXXX`, for `https://wa.me/<number>`. */
	whatsapp: ''
};

export const socialLinks = [
	{ name: 'Facebook', url: '' },
	{ name: 'Instagram', url: '' },
	{ name: 'TikTok', url: '' },
	{ name: 'YouTube', url: '' }
];
