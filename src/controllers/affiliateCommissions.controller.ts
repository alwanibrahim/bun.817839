import { redis } from '../redis';
import { db } from "../db";
import { affiliateCommissions, users, deposits } from "../db/schema";
import { response } from "../utils/response";
import { eq, desc, sql, and } from "drizzle-orm";
import { z } from "zod";


export class AffiliateController {
    static createAffiliateCommissionSchema = z.object({
        referrerId: z.number(),
        referredId: z.number(),
        depositId: z.number(),
        commissionAmount: z.number().positive(),
    });

    static updateAffiliateCommissionSchema =
        AffiliateController.createAffiliateCommissionSchema.partial();

    // ========================
    // 📄 GET /affiliate/commissions
    // ========================


    static async index() { 
        const cacheKey = `affiliate:commissions:all`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("data semua komisi dari cache");
            const parsed = JSON.parse(cached);
            return response.success(parsed, "data semua komisi dari cache");
        }   
        const data =await db.select().from(affiliateCommissions);
        await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
        console.log("data semua komisi dari db");
        return response.success(data, "Affiliate index");
    }
    static async commissions({ query, user }: any) {
        const page = Number(query.page ?? 1);
        const limit = 15;
        const offset = (page - 1) * limit;
        const cacheKey = `affiliate:commissions:user:${user.id}:page:${page}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("data komisi dari cache");
            const parsed = JSON.parse(cached);
            return response.success(parsed, "data komisi dari cache");
        }

        const data = await db
            .select({
                id: affiliateCommissions.id,
                commissionAmount: affiliateCommissions.commissionAmount,
                createdAt: affiliateCommissions.createdAt,
                referred: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                },
                deposit: {
                    id: deposits.id,
                    amount: deposits.amount,
                    status: deposits.status,
                },
            })
            .from(affiliateCommissions)
            .leftJoin(users, eq(affiliateCommissions.referredId, users.id))
            .leftJoin(deposits, eq(affiliateCommissions.depositId, deposits.id))
            .where(eq(affiliateCommissions.referrerId, user.id))
            .orderBy(desc(affiliateCommissions.createdAt))
            .limit(limit)
            .offset(offset);
        // simpan ke redis dengan expired 5 menit
        await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
        console.log("data komisi dari db");

        return response.success(data, "Data komisi");
    }

    // ========================
    // 📄 GET /affiliate/referrals
    // ========================
    static async referrals({ query, user }: any) {
        const page = Number(query.page ?? 1);
        const limit = 15;
        const offset = (page - 1) * limit;
        const cacheKey = `affiliate:referrals:user:${user.id}:page:${page}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("data referral dari cache");
            const parsed = JSON.parse(cached);
            return response.success(parsed, "data referral dari cache");
        }

        const referrals = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                depositsCount: sql<number>`COALESCE(COUNT(${deposits.id}), 0)`.as(
                    "depositsCount"
                ),
                createdAt: users.createdAt,
            })
            .from(users)
            .leftJoin(deposits, eq(users.id, deposits.userId))
            .where(eq(users.referredBy, user.id)) // ✅ benar: pakai referredBy
            .groupBy(users.id, users.name, users.email, users.createdAt)
            .orderBy(desc(users.createdAt))
            .limit(limit)
            .offset(offset);
        // simpan ke redis dengan expired 5 menit
        await redis.set(cacheKey, JSON.stringify(referrals), "EX", 300);
        console.log("data referral dari db");

        return response.success(referrals, "Data referral");
    }

    // ========================
    // 📊 GET /affiliate/stats
    // ========================
    static async stats({ user }: any) {
        const cacheKey = `affiliate:stats:user:${user.id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("data stats dari cache");
            const parsed = JSON.parse(cached);
            return response.success(parsed, "data stats dari cache");
        }
        // ✅ total referral
        const [refCount] = await db
            .select({ totalReferrals: sql<number>`COUNT(*)` })
            .from(users)
            .where(eq(users.referredBy, user.id));

        // ✅ total komisi
        const [totalCom] = await db
            .select({
                totalCommissions: sql<number>`
          COALESCE(SUM(${affiliateCommissions.commissionAmount}), 0)
        `,
            })
            .from(affiliateCommissions)
            .where(eq(affiliateCommissions.referrerId, user.id));

        // ✅ komisi bulan ini
        const [monthCom] = await db
            .select({
                thisMonthCommissions: sql<number>`
          COALESCE(SUM(${affiliateCommissions.commissionAmount}), 0)
        `,
            })
            .from(affiliateCommissions)
            .where(
                and(
                    eq(affiliateCommissions.referrerId, user.id),
                    sql`MONTH(${affiliateCommissions.createdAt}) = MONTH(NOW())`,
                    sql`YEAR(${affiliateCommissions.createdAt}) = YEAR(NOW())`
                )
            );
        // simpan ke redis dengan expired 5 menit
        const statsData = {
            referral_code: user.referralCode,
            total_referrals: refCount?.totalReferrals ?? 0,
            total_commissions: totalCom?.totalCommissions ?? 0,
            this_month_commissions: monthCom?.thisMonthCommissions ?? 0,
        };
        await redis.set(cacheKey, JSON.stringify(statsData), "EX", 300);
        console.log("data stats dari db");

        // ✅ hasil akhir
        return response.success(
            {
                referral_code: user.referralCode,
                total_referrals: refCount?.totalReferrals ?? 0,
                total_commissions: totalCom?.totalCommissions ?? 0,
                this_month_commissions: monthCom?.thisMonthCommissions ?? 0,
            },
            "Statistik affiliate"
        );
    }

    // ========================
    // (Belum diisi)
    // ========================
    static async store({ body, user, set }: any) { }
    static async update({ params, body, set }: any) { }
    static async destroy({params}: any){
        const id = Number(params.id)
        await db.delete(affiliateCommissions).where(eq(affiliateCommissions.id, id))
        await redis.del(`affiliate:commissions:all`) // menghapus cache setelah data berubah
        return response.success(null, "komisi affiliate berhasil dihapus")
    }
}
