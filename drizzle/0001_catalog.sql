CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_bn` text DEFAULT '' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`variant_id` integer,
	`r2_key` text NOT NULL,
	`alt_en` text DEFAULT '' NOT NULL,
	`alt_bn` text DEFAULT '' NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "product_images_size_check" CHECK("product_images"."width" > 0 and "product_images"."height" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_images_r2_key_unique` ON `product_images` (`r2_key`);--> statement-breakpoint
CREATE INDEX `product_images_product_position_idx` ON `product_images` (`product_id`,`position`);--> statement-breakpoint
CREATE INDEX `product_images_variant_idx` ON `product_images` (`variant_id`);--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`colour_name_en` text NOT NULL,
	`colour_name_bn` text DEFAULT '' NOT NULL,
	`colour_hex` text NOT NULL,
	`sku` text NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "product_variants_stock_check" CHECK("product_variants"."stock" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_sku_unique` ON `product_variants` (`sku`);--> statement-breakpoint
CREATE INDEX `product_variants_product_position_idx` ON `product_variants` (`product_id`,`position`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_bn` text DEFAULT '' NOT NULL,
	`description_en` text DEFAULT '' NOT NULL,
	`description_bn` text DEFAULT '' NOT NULL,
	`category_id` integer NOT NULL,
	`price` integer NOT NULL,
	`compare_at_price` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_new` integer DEFAULT false NOT NULL,
	`is_best_seller` integer DEFAULT false NOT NULL,
	`show_on_home` integer DEFAULT false NOT NULL,
	`include_in_meta_catalog` integer DEFAULT false NOT NULL,
	`size_en` text DEFAULT '' NOT NULL,
	`size_bn` text DEFAULT '' NOT NULL,
	`material_en` text DEFAULT '' NOT NULL,
	`material_bn` text DEFAULT '' NOT NULL,
	`strap_drop_en` text DEFAULT '' NOT NULL,
	`strap_drop_bn` text DEFAULT '' NOT NULL,
	`inside_en` text DEFAULT '' NOT NULL,
	`inside_bn` text DEFAULT '' NOT NULL,
	`youtube_video_id` text,
	`sku_prefix` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "products_status_check" CHECK("products"."status" in ('published', 'draft', 'hidden')),
	CONSTRAINT "products_price_check" CHECK("products"."price" >= 0),
	CONSTRAINT "products_compare_at_price_check" CHECK("products"."compare_at_price" is null or "products"."compare_at_price" > "products"."price")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_status_category_created_idx` ON `products` (`status`,`category_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `products_show_on_home_idx` ON `products` (`show_on_home`);