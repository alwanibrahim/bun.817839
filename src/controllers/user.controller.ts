import { db } from "../db";
import { users } from "../db/schema";
import { response } from "../utils/response";
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { redis } from '../redis'

export class UserController {
    static createUserSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        password: z.string().min(6),
        referralCode: z.string().optional(),
        referredBy: z.number().optional(),
        balance: z.number().default(0),
        isVerified: z.boolean().default(false),
        role: z.enum(["admin", "user"]).default("user"),
    });

    static updateUserSchema = UserController.createUserSchema.partial();
    static async index() {
        const cacheKey = `users:all`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("data users dari cache");
            const parsed = JSON.parse(cached);
            return response.success(parsed, "data users dari cache");
        }
        const data = await db.select().from(users)
        // simpan ke redis dengan expired 5 menit
        await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
        console.log("data users dari db");
        return response.success(data, "data berhasil")
    }

    static async me({ user }: any) {
        const cacheKey = `user:me:${user.id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("data user dari cache");
            const parsed = JSON.parse(cached);
            return response.success(parsed, "data user dari cache");
        }

        const data = await db.select().from(users).where(eq(users.id, user.id)).limit(2)
        if (!data) return response.fail("data tidak di temukan")
        // simpan ke redis dengan expired 5 menit
        await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
        console.log("data user dari db");
        return response.success(data, "data berhasil")

    }

    static async store({ body, user, set }: any) {

    }
    static async update({ params, body }: any) {
        const id = Number(params.id);

        // 1️⃣ Pastikan user ada
        const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (existing.length === 0) {
            return response.fail(`User dengan ID ${id} tidak ditemukan`);
        }

        // 2️⃣ Hanya update field yang boleh (name & email)
        const updateData = {
            name: body.name,
            email: body.email,
        };

        // 3️⃣ Jalankan update (biarkan MySQL yang set updated_at)
        await db.update(users).set(updateData).where(eq(users.id, id));

        // 4️⃣ Ambil data terbaru setelah update
        const [updatedUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);

        // 5️⃣ Hapus cache
        const cacheKey = `user:me:${id}`;
        await redis.del(cacheKey);

        return response.success(updatedUser, `User dengan ID ${id} berhasil diupdate`);
    }

    static async destroy({ params }: any) {
        const id = Number(params.id)
        await db.delete(users).where(eq(users.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
