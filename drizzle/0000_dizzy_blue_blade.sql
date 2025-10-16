-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `affiliate_commissions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`referrer_id` bigint unsigned NOT NULL,
	`referred_id` bigint unsigned NOT NULL,
	`deposit_id` bigint unsigned NOT NULL,
	`commission_amount` decimal(15,2) NOT NULL,
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255),
	`description` text,
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deposits` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`reference` varchar(255) NOT NULL,
	`payment_method` varchar(255) NOT NULL,
	`payment_url` varchar(255),
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deposits_id` PRIMARY KEY(`id`),
	CONSTRAINT `deposits_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `distributions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`account_id` bigint unsigned,
	`invite_id` bigint unsigned,
	`status` enum('pending','sent','completed') NOT NULL DEFAULT 'pending',
	`instructions_sent` tinyint NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `distributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_read` tinyint NOT NULL DEFAULT 0,
	`type` enum('system','admin') NOT NULL DEFAULT 'system',
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`code` varchar(255) NOT NULL,
	`type` enum('email','sms') NOT NULL DEFAULT 'email',
	`status` enum('pending','used','expired') NOT NULL DEFAULT 'pending',
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `otp_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_accounts` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL DEFAULT 'masuk123',
	`is_used` tinyint NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_invites` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`invite_link_or_email` varchar(255) NOT NULL,
	`assigned_user_id` bigint unsigned,
	`status` enum('pending','clicked','accepted') NOT NULL DEFAULT 'pending',
	`sent_at` timestamp,
	`clicked_at` timestamp,
	`accepted_at` timestamp,
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_invites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_types` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `product_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_types_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`duration` varchar(255),
	`price` decimal(10,2) NOT NULL,
	`original_price` decimal(10,2),
	`status` enum('READY','NOT_READY') NOT NULL DEFAULT 'READY',
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type_id` bigint,
	`description` text,
	`image_url` varchar(255),
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`category_id` bigint unsigned,
	`features` json DEFAULT ('[]'),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(255),
	`email_verified_at` timestamp,
	`password` varchar(255) NOT NULL,
	`referral_code` varchar(255),
	`referred_by` bigint unsigned,
	`balance` decimal(15,2) NOT NULL DEFAULT '0.00',
	`is_verified` tinyint(1) NOT NULL DEFAULT 0,
	`role` enum('admin','user') NOT NULL DEFAULT 'user',
	`created_at` timestamp,
	`updated_at` timestamp,
	`session_key` int DEFAULT 1,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_referral_code_unique` UNIQUE(`referral_code`)
);
--> statement-breakpoint
ALTER TABLE `affiliate_commissions` ADD CONSTRAINT `affiliate_commissions_deposit_id_deposits_id_fk` FOREIGN KEY (`deposit_id`) REFERENCES `deposits`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `affiliate_commissions` ADD CONSTRAINT `affiliate_commissions_referred_id_users_id_fk` FOREIGN KEY (`referred_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `affiliate_commissions` ADD CONSTRAINT `affiliate_commissions_referrer_id_users_id_fk` FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deposits` ADD CONSTRAINT `deposits_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `distributions` ADD CONSTRAINT `distributions_account_id_product_accounts_id_fk` FOREIGN KEY (`account_id`) REFERENCES `product_accounts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `distributions` ADD CONSTRAINT `distributions_invite_id_product_invites_id_fk` FOREIGN KEY (`invite_id`) REFERENCES `product_invites`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `distributions` ADD CONSTRAINT `distributions_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `distributions` ADD CONSTRAINT `distributions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `otp_codes` ADD CONSTRAINT `otp_codes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_accounts` ADD CONSTRAINT `product_accounts_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_invites` ADD CONSTRAINT `product_invites_assigned_user_id_users_id_fk` FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_invites` ADD CONSTRAINT `product_invites_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_type_id_product_types_id_fk` FOREIGN KEY (`type_id`) REFERENCES `product_types`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_referred_by_foreign` FOREIGN KEY (`referred_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `affiliate_commissions_referrer_id_referred_id_index` ON `affiliate_commissions` (`referrer_id`,`referred_id`);--> statement-breakpoint
CREATE INDEX `deposits_user_id_status_index` ON `deposits` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `distributions_user_id_status_index` ON `distributions` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `notifications_user_id_is_read_index` ON `notifications` (`user_id`,`is_read`);--> statement-breakpoint
CREATE INDEX `otp_codes_user_id_status_index` ON `otp_codes` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `product_accounts_product_id_is_used_index` ON `product_accounts` (`product_id`,`is_used`);--> statement-breakpoint
CREATE INDEX `product_invites_product_id_status_index` ON `product_invites` (`product_id`,`status`);--> statement-breakpoint
CREATE INDEX `users_referral_code_referred_by_index` ON `users` (`referral_code`,`referred_by`);
*/