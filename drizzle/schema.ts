import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, primaryKey, bigint, decimal, timestamp, varchar, mediumtext, int, unique, text, mysqlEnum, tinyint, longtext, json } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const affiliateCommissions = mysqlTable("affiliate_commissions", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	referrerId: bigint("referrer_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	referredId: bigint("referred_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	depositId: bigint("deposit_id", { mode: "number", unsigned: true }).notNull().references(() => deposits.id, { onDelete: "cascade" } ),
	commissionAmount: decimal("commission_amount", { precision: 15, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	index("affiliate_commissions_referrer_id_referred_id_index").on(table.referrerId, table.referredId),
	primaryKey({ columns: [table.id], name: "affiliate_commissions_id"}),
]);

export const cache = mysqlTable("cache", {
	key: varchar({ length: 255 }).notNull(),
	value: mediumtext().notNull(),
	expiration: int().notNull(),
},
(table) => [
	primaryKey({ columns: [table.key], name: "cache_key"}),
]);

export const cacheLocks = mysqlTable("cache_locks", {
	key: varchar({ length: 255 }).notNull(),
	owner: varchar({ length: 255 }).notNull(),
	expiration: int().notNull(),
},
(table) => [
	primaryKey({ columns: [table.key], name: "cache_locks_key"}),
]);

export const categories = mysqlTable("categories", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "categories_id"}),
	unique("categories_slug_unique").on(table.slug),
]);

export const deposits = mysqlTable("deposits", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	amount: decimal({ precision: 15, scale: 2 }).notNull(),
	status: mysqlEnum(['pending','completed','failed']).default('pending').notNull(),
	reference: varchar({ length: 255 }).notNull(),
	paymentMethod: varchar("payment_method", { length: 255 }).notNull(),
	paymentUrl: varchar("payment_url", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	index("deposits_user_id_status_index").on(table.userId, table.status),
	primaryKey({ columns: [table.id], name: "deposits_id"}),
	unique("deposits_reference_unique").on(table.reference),
]);

export const distributions = mysqlTable("distributions", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" } ),
	accountId: bigint("account_id", { mode: "number", unsigned: true }).references(() => productAccounts.id, { onDelete: "set null" } ),
	inviteId: bigint("invite_id", { mode: "number", unsigned: true }).references(() => productInvites.id, { onDelete: "set null" } ),
	status: mysqlEnum(['pending','sent','completed']).default('pending').notNull(),
	instructionsSent: tinyint("instructions_sent").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	index("distributions_user_id_status_index").on(table.userId, table.status),
	primaryKey({ columns: [table.id], name: "distributions_id"}),
]);

export const failedJobs = mysqlTable("failed_jobs", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	uuid: varchar({ length: 255 }).notNull(),
	connection: text().notNull(),
	queue: text().notNull(),
	payload: longtext().notNull(),
	exception: longtext().notNull(),
	failedAt: timestamp("failed_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "failed_jobs_id"}),
	unique("failed_jobs_uuid_unique").on(table.uuid),
]);

export const jobBatches = mysqlTable("job_batches", {
	id: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	totalJobs: int("total_jobs").notNull(),
	pendingJobs: int("pending_jobs").notNull(),
	failedJobs: int("failed_jobs").notNull(),
	failedJobIds: longtext("failed_job_ids").notNull(),
	options: mediumtext(),
	cancelledAt: int("cancelled_at"),
	createdAt: int("created_at").notNull(),
	finishedAt: int("finished_at"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "job_batches_id"}),
]);

export const jobs = mysqlTable("jobs", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	queue: varchar({ length: 255 }).notNull(),
	payload: longtext().notNull(),
	attempts: tinyint({ unsigned: true }).notNull(),
	reservedAt: int("reserved_at", { unsigned: true }),
	availableAt: int("available_at", { unsigned: true }).notNull(),
	createdAt: int("created_at", { unsigned: true }).notNull(),
},
(table) => [
	index("jobs_queue_index").on(table.queue),
	primaryKey({ columns: [table.id], name: "jobs_id"}),
]);

export const migrations = mysqlTable("migrations", {
	id: int({ unsigned: true }).autoincrement().notNull(),
	migration: varchar({ length: 255 }).notNull(),
	batch: int().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "migrations_id"}),
]);

export const notifications = mysqlTable("notifications", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	isRead: tinyint("is_read").default(0).notNull(),
	type: mysqlEnum(['system','admin']).default('system').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	index("notifications_user_id_is_read_index").on(table.userId, table.isRead),
	primaryKey({ columns: [table.id], name: "notifications_id"}),
]);

export const otpCodes = mysqlTable("otp_codes", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	code: varchar({ length: 255 }).notNull(),
	type: mysqlEnum(['email','sms']).notNull(),
	status: mysqlEnum(['pending','used','expired']).default('pending').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	index("otp_codes_user_id_status_index").on(table.userId, table.status),
	primaryKey({ columns: [table.id], name: "otp_codes_id"}),
]);

export const personalAccessTokens = mysqlTable("personal_access_tokens", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tokenableType: varchar("tokenable_type", { length: 255 }).notNull(),
	tokenableId: bigint("tokenable_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	token: varchar({ length: 64 }).notNull(),
	abilities: text(),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	index("personal_access_tokens_tokenable_type_tokenable_id_index").on(table.tokenableType, table.tokenableId),
	primaryKey({ columns: [table.id], name: "personal_access_tokens_id"}),
	unique("personal_access_tokens_token_unique").on(table.token),
]);

export const productAccounts = mysqlTable("product_accounts", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" } ),
	username: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	isUsed: tinyint("is_used").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	index("product_accounts_product_id_is_used_index").on(table.productId, table.isUsed),
	primaryKey({ columns: [table.id], name: "product_accounts_id"}),
]);

export const productInvites = mysqlTable("product_invites", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" } ),
	inviteLinkOrEmail: varchar("invite_link_or_email", { length: 255 }).notNull(),
	assignedUserId: bigint("assigned_user_id", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" } ),
	status: mysqlEnum(['pending','clicked','accepted']).default('pending').notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	clickedAt: timestamp("clicked_at", { mode: 'string' }),
	acceptedAt: timestamp("accepted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	index("product_invites_product_id_status_index").on(table.productId, table.status),
	primaryKey({ columns: [table.id], name: "product_invites_id"}),
]);

export const productVariants = mysqlTable("product_variants", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	duration: varchar({ length: 255 }),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
	status: mysqlEnum(['READY','NOT_READY']).default('READY').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "product_variants_id"}),
]);

export const products = mysqlTable("products", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: mysqlEnum(['account','invite','family']).notNull(),
	price: decimal({ precision: 15, scale: 2 }).notNull(),
	originalPrice: decimal("original_price", { precision: 15, scale: 2 }),
	description: text(),
	imageUrl: varchar("image_url", { length: 255 }),
	features: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
	categoryId: bigint("category_id", { mode: "number", unsigned: true }).references(() => categories.id, { onDelete: "set null" } ),
},
(table) => [
	index("products_type_index").on(table.type),
	primaryKey({ columns: [table.id], name: "products_id"}),
]);

export const sessions = mysqlTable("sessions", {
	id: varchar({ length: 255 }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	payload: longtext().notNull(),
	lastActivity: int("last_activity").notNull(),
},
(table) => [
	index("sessions_last_activity_index").on(table.lastActivity),
	index("sessions_user_id_index").on(table.userId),
	primaryKey({ columns: [table.id], name: "sessions_id"}),
]);

export const users = mysqlTable("users", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 255 }),
	emailVerifiedAt: timestamp("email_verified_at", { mode: 'string' }),
	password: varchar({ length: 255 }).notNull(),
	referralCode: varchar("referral_code", { length: 255 }),
	referredBy: bigint("referred_by", { mode: "number", unsigned: true }),
	balance: decimal({ precision: 15, scale: 2 }).default('0.00').notNull(),
	isVerified: tinyint("is_verified").default(0).notNull(),
	role: mysqlEnum(['admin','user']).default('user').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	sessionKey: int("session_key").default(1),
},
(table) => [
	index("users_referral_code_referred_by_index").on(table.referralCode, table.referredBy),
	foreignKey({
			columns: [table.referredBy],
			foreignColumns: [table.id],
			name: "users_referred_by_foreign"
		}).onDelete("set null"),
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("users_email_unique").on(table.email),
	unique("users_referral_code_unique").on(table.referralCode),
]);
