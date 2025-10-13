import { db } from "../db";
import { users } from "../db/schema";
import { response } from "../utils/response";
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export class UserController {
    static  createUserSchema = z.object({
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
        const data = await db.select().from(users)
        return response.success(data, "data berhasil")
    }

    static async me({user}: any) {
        const data = await db.select().from(users).where(eq(users.id, user.id)).limit(2)
        if(!data) return response.fail("data tidak di temukan")
            return response.success(data, "data berhasil")

    }

    static async store({ body, user, set }: any) {

    }
    static async update({ params, body, set }: any) {

    }
    static async destroy({ params }: any) {
        const id = Number(params.id)
        await db.delete(users).where(eq(users.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
