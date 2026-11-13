CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text NOT NULL,
	`name` text NOT NULL,
	`is_blocked` integer DEFAULT false NOT NULL,
	`orders_count` integer DEFAULT 0 NOT NULL,
	`delivered_count` integer DEFAULT 0 NOT NULL,
	`returned_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT "customers_counts_check" CHECK("customers"."orders_count" >= 0 and "customers"."delivered_count" >= 0 and "customers"."returned_count" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_phone_unique` ON `customers` (`phone`);--> statement-breakpoint
CREATE TABLE `order_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`type` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`actor` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_events_order_created_idx` ON `order_events` (`order_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer,
	`variant_id` integer,
	`product_name_en` text NOT NULL,
	`product_name_bn` text DEFAULT '' NOT NULL,
	`colour_name_en` text NOT NULL,
	`colour_name_bn` text DEFAULT '' NOT NULL,
	`unit_price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`line_total` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "order_items_money_check" CHECK("order_items"."unit_price" >= 0 and "order_items"."quantity" > 0 and "order_items"."line_total" = "order_items"."unit_price" * "order_items"."quantity")
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` text NOT NULL,
	`customer_id` integer NOT NULL,
	`source` text DEFAULT 'website' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text DEFAULT 'cod' NOT NULL,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`subtotal` integer NOT NULL,
	`delivery_fee` integer NOT NULL,
	`total` integer NOT NULL,
	`delivery_zone` text NOT NULL,
	`district_id` text NOT NULL,
	`address` text NOT NULL,
	`area_landmark` text DEFAULT '' NOT NULL,
	`customer_note` text DEFAULT '' NOT NULL,
	`courier_name` text,
	`consignment_id` text,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`utm_content` text,
	`utm_term` text,
	`fbclid` text,
	`idempotency_key` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "orders_status_check" CHECK("orders"."status" in ('pending', 'confirmed', 'shipped', 'delivered', 'returned', 'cancelled')),
	CONSTRAINT "orders_source_check" CHECK("orders"."source" in ('website', 'whatsapp', 'facebook', 'phone')),
	CONSTRAINT "orders_payment_method_check" CHECK("orders"."payment_method" in ('cod')),
	CONSTRAINT "orders_payment_status_check" CHECK("orders"."payment_status" in ('unpaid', 'collected')),
	CONSTRAINT "orders_delivery_zone_check" CHECK("orders"."delivery_zone" in ('inside_dhaka', 'outside_dhaka')),
	CONSTRAINT "orders_money_check" CHECK("orders"."subtotal" >= 0 and "orders"."delivery_fee" >= 0 and "orders"."total" = "orders"."subtotal" + "orders"."delivery_fee")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_number_unique` ON `orders` (`number`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_key_unique` ON `orders` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `orders_status_created_idx` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_customer_idx` ON `orders` (`customer_id`);