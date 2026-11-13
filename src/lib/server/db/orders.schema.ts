import { relations, sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { products, productVariants } from './catalog.schema';

// Orders and customers (issue #61). Money is integer poisha; timestamps are UTC epoch ms.

export const ORDER_STATUSES = [
	'pending',
	'confirmed',
	'shipped',
	'delivered',
	'returned',
	'cancelled'
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_SOURCES = ['website', 'whatsapp', 'facebook', 'phone'] as const;
export const PAYMENT_METHODS = ['cod'] as const;
export const PAYMENT_STATUSES = ['unpaid', 'collected'] as const;
export const DELIVERY_ZONE_IDS = ['inside_dhaka', 'outside_dhaka'] as const;

// No DB CHECK on purpose: new event types must not need a table rebuild.
export const ORDER_EVENT_TYPES = ['status_change', 'note', 'sms_sent', 'alert_sent'] as const;
export type OrderEventType = (typeof ORDER_EVENT_TYPES)[number];

const nowMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const customers = sqliteTable(
	'customers',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		/** Canonical `+8801XXXXXXXXX` (normalizeBdPhone). */
		phone: text('phone').notNull().unique(),
		name: text('name').notNull(),
		isBlocked: integer('is_blocked', { mode: 'boolean' }).notNull().default(false),
		ordersCount: integer('orders_count').notNull().default(0),
		deliveredCount: integer('delivered_count').notNull().default(0),
		returnedCount: integer('returned_count').notNull().default(0),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(nowMs).notNull()
	},
	(table) => [
		check(
			'customers_counts_check',
			sql`${table.ordersCount} >= 0 and ${table.deliveredCount} >= 0 and ${table.returnedCount} >= 0`
		)
	]
);

export const orders = sqliteTable(
	'orders',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		/** Public order number, e.g. `BV-10234`. */
		number: text('number').notNull().unique(),
		// restrict: a customer with orders cannot be deleted.
		customerId: integer('customer_id')
			.notNull()
			.references(() => customers.id, { onDelete: 'restrict' }),
		source: text('source', { enum: ORDER_SOURCES }).notNull().default('website'),
		status: text('status', { enum: ORDER_STATUSES }).notNull().default('pending'),
		paymentMethod: text('payment_method', { enum: PAYMENT_METHODS }).notNull().default('cod'),
		paymentStatus: text('payment_status', { enum: PAYMENT_STATUSES }).notNull().default('unpaid'),
		subtotal: integer('subtotal').notNull(),
		deliveryFee: integer('delivery_fee').notNull(),
		total: integer('total').notNull(),
		deliveryZone: text('delivery_zone', { enum: DELIVERY_ZONE_IDS }).notNull(),
		/** District slug from src/lib/districts.ts. */
		districtId: text('district_id').notNull(),
		address: text('address').notNull(),
		areaLandmark: text('area_landmark').notNull().default(''),
		customerNote: text('customer_note').notNull().default(''),
		courierName: text('courier_name'),
		consignmentId: text('consignment_id'),
		utmSource: text('utm_source'),
		utmMedium: text('utm_medium'),
		utmCampaign: text('utm_campaign'),
		utmContent: text('utm_content'),
		utmTerm: text('utm_term'),
		fbclid: text('fbclid'),
		idempotencyKey: text('idempotency_key').notNull().unique(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(nowMs).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(nowMs)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [
		index('orders_status_created_idx').on(table.status, table.createdAt),
		index('orders_customer_idx').on(table.customerId),
		check(
			'orders_status_check',
			sql`${table.status} in ('pending', 'confirmed', 'shipped', 'delivered', 'returned', 'cancelled')`
		),
		check(
			'orders_source_check',
			sql`${table.source} in ('website', 'whatsapp', 'facebook', 'phone')`
		),
		check('orders_payment_method_check', sql`${table.paymentMethod} in ('cod')`),
		check('orders_payment_status_check', sql`${table.paymentStatus} in ('unpaid', 'collected')`),
		check(
			'orders_delivery_zone_check',
			sql`${table.deliveryZone} in ('inside_dhaka', 'outside_dhaka')`
		),
		check(
			'orders_money_check',
			sql`${table.subtotal} >= 0 and ${table.deliveryFee} >= 0 and ${table.total} = ${table.subtotal} + ${table.deliveryFee}`
		)
	]
);

export const orderItems = sqliteTable(
	'order_items',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		orderId: integer('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		// set null: the snapshot below keeps the history when a product or colour is deleted.
		productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
		variantId: integer('variant_id').references(() => productVariants.id, {
			onDelete: 'set null'
		}),
		productNameEn: text('product_name_en').notNull(),
		productNameBn: text('product_name_bn').notNull().default(''),
		colourNameEn: text('colour_name_en').notNull(),
		colourNameBn: text('colour_name_bn').notNull().default(''),
		unitPrice: integer('unit_price').notNull(),
		quantity: integer('quantity').notNull(),
		lineTotal: integer('line_total').notNull()
	},
	(table) => [
		index('order_items_order_idx').on(table.orderId),
		check(
			'order_items_money_check',
			sql`${table.unitPrice} >= 0 and ${table.quantity} > 0 and ${table.lineTotal} = ${table.unitPrice} * ${table.quantity}`
		)
	]
);

export const orderEvents = sqliteTable(
	'order_events',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		orderId: integer('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		type: text('type', { enum: ORDER_EVENT_TYPES }).notNull(),
		/** For `status_change`: the new status. Otherwise free text (e.g. a private note). */
		message: text('message').notNull().default(''),
		/** `customer`, `system`, or the admin's user id. */
		actor: text('actor').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(nowMs).notNull()
	},
	(table) => [index('order_events_order_created_idx').on(table.orderId, table.createdAt)]
);

export const customersRelations = relations(customers, ({ many }) => ({
	orders: many(orders)
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
	customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
	items: many(orderItems),
	events: many(orderEvents)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
	product: one(products, { fields: [orderItems.productId], references: [products.id] }),
	variant: one(productVariants, {
		fields: [orderItems.variantId],
		references: [productVariants.id]
	})
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
	order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] })
}));
