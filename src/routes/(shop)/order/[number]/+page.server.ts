import { env } from 'cloudflare:workers';
import { error } from '@sveltejs/kit';
import { DISTRICTS } from '#lib/districts.ts';
import { DELIVERY_ZONES } from '#lib/delivery.ts';
import { localized } from '#lib/localized.ts';
import { m } from '#lib/paraglide/messages.js';
import { getLocale } from '#lib/paraglide/runtime.js';
import { localBdPhone } from '#lib/phone.ts';
import { getDb } from '#lib/server/db/index.ts';
import { getOrderForCustomer, ORDER_ACCESS_COOKIE } from '#lib/server/orders/queries.ts';
import type { PageServerLoad } from './$types';

// Personal page: only the browser that placed the order (it holds the access cookie) sees it.
export const load: PageServerLoad = async ({ params, cookies }) => {
	const key = cookies.get(ORDER_ACCESS_COOKIE);
	const order = key ? await getOrderForCustomer(getDb(env.DB), params.number, key) : null;
	if (!order) error(404, m.error_not_found_title());

	const locale = getLocale();
	const district = DISTRICTS.find((d) => d.id === order.districtId);
	return {
		order: {
			number: order.number,
			subtotal: order.subtotal,
			deliveryFee: order.deliveryFee,
			total: order.total,
			eta: DELIVERY_ZONES[order.deliveryZone].etaDays,
			district: district ? localized(district.en, district.bn, locale) : order.districtId,
			phone: localBdPhone(order.customer.phone),
			items: order.items.map((item) => ({
				name: localized(item.productNameEn, item.productNameBn, locale),
				colour: localized(item.colourNameEn, item.colourNameBn, locale),
				quantity: item.quantity,
				lineTotal: item.lineTotal
			}))
		}
	};
};
