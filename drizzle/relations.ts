import { relations } from "drizzle-orm/relations";
import { deposits, affiliateCommissions, users, productAccounts, distributions, productInvites, products, notifications, otpCodes, productVariants, categories } from "./schema";

export const affiliateCommissionsRelations = relations(affiliateCommissions, ({one}) => ({
	deposit: one(deposits, {
		fields: [affiliateCommissions.depositId],
		references: [deposits.id]
	}),
	user_referredId: one(users, {
		fields: [affiliateCommissions.referredId],
		references: [users.id],
		relationName: "affiliateCommissions_referredId_users_id"
	}),
	user_referrerId: one(users, {
		fields: [affiliateCommissions.referrerId],
		references: [users.id],
		relationName: "affiliateCommissions_referrerId_users_id"
	}),
}));

export const depositsRelations = relations(deposits, ({one, many}) => ({
	affiliateCommissions: many(affiliateCommissions),
	user: one(users, {
		fields: [deposits.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	affiliateCommissions_referredId: many(affiliateCommissions, {
		relationName: "affiliateCommissions_referredId_users_id"
	}),
	affiliateCommissions_referrerId: many(affiliateCommissions, {
		relationName: "affiliateCommissions_referrerId_users_id"
	}),
	deposits: many(deposits),
	distributions: many(distributions),
	notifications: many(notifications),
	otpCodes: many(otpCodes),
	productInvites: many(productInvites),
	user: one(users, {
		fields: [users.referredBy],
		references: [users.id],
		relationName: "users_referredBy_users_id"
	}),
	users: many(users, {
		relationName: "users_referredBy_users_id"
	}),
}));

export const distributionsRelations = relations(distributions, ({one}) => ({
	productAccount: one(productAccounts, {
		fields: [distributions.accountId],
		references: [productAccounts.id]
	}),
	productInvite: one(productInvites, {
		fields: [distributions.inviteId],
		references: [productInvites.id]
	}),
	product: one(products, {
		fields: [distributions.productId],
		references: [products.id]
	}),
	user: one(users, {
		fields: [distributions.userId],
		references: [users.id]
	}),
}));

export const productAccountsRelations = relations(productAccounts, ({one, many}) => ({
	distributions: many(distributions),
	product: one(products, {
		fields: [productAccounts.productId],
		references: [products.id]
	}),
}));

export const productInvitesRelations = relations(productInvites, ({one, many}) => ({
	distributions: many(distributions),
	user: one(users, {
		fields: [productInvites.assignedUserId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [productInvites.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	distributions: many(distributions),
	productAccounts: many(productAccounts),
	productInvites: many(productInvites),
	productVariants: many(productVariants),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const otpCodesRelations = relations(otpCodes, ({one}) => ({
	user: one(users, {
		fields: [otpCodes.userId],
		references: [users.id]
	}),
}));

export const productVariantsRelations = relations(productVariants, ({one}) => ({
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));