ALTER TABLE `product_accounts` MODIFY COLUMN `password` varchar(255) NOT NULL DEFAULT 'masuk123';--> statement-breakpoint
ALTER TABLE `product_accounts` MODIFY COLUMN `created_at` timestamp DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `product_accounts` MODIFY COLUMN `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;