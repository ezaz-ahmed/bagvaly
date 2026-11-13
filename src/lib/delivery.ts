import { DISTRICTS } from './districts';

/** Delivery fee (poisha) and ETA range (days) per zone. Values confirmed by the owner. */
export const DELIVERY_ZONES = {
	inside_dhaka: { fee: 7_000, etaDays: { min: 2, max: 3 } },
	outside_dhaka: { fee: 13_000, etaDays: { min: 3, max: 5 } }
} as const;

export type DeliveryZone = keyof typeof DELIVERY_ZONES;

/** Zone for a district id, or `null` for an unknown id. Only Dhaka district is inside Dhaka. */
export function zoneForDistrict(districtId: string): DeliveryZone | null {
	if (!DISTRICTS.some((district) => district.id === districtId)) return null;
	return districtId === 'dhaka' ? 'inside_dhaka' : 'outside_dhaka';
}
