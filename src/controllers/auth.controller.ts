import { z } from 'zod'
import { response } from '../utils/response'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import moduleName from '@elysiajs/jwt'
export class AuthController {

    static registerSchema = z.object({
        name: z.string("masukkan nama dengan benar").min(3, "minimal 3 karakter"),
        email: z.string("masukkan email degan benar").email(),
        password: z.string("masukkan password dengan benar").min(6, "minimal 6 karakter")
    })

    static loginSchema = z.object({
        email: z.string("masukkan email degan benar").email(),
        password: z.string("masukkan password dengan benar").min(6, "minimal 6 karakter")
    })

    static async login({ body, jwt }: any) {
        const parse = AuthController.loginSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
        const { email, password } = parse.data
        const data = await db.select().from(users).where(eq(users.email, email))
        if (data.length === 0) return response.fail("data tidak di temukan silahkan register")
        const user = data[0]
        const isValid = await bcrypt.compare(password, data[0].password)
        if (!isValid) return response.fail("password salah", 401)
        const newSessionKey = (Number(user.sessionKey) || 0) + 1;
        await db.update(users).set({ sessionKey: newSessionKey }).where(eq(users.id, user.id))

        const token = await jwt.sign({
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
            sessionKey: newSessionKey
        })

        return response.success({
            token, user: {
                id: data[0].id,
                name: data[0].name
            }
        }, "login berhasil")


    }
    static async register({ body }: any) {
        const parse = AuthController.registerSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)

        const { email, name, password } = parse.data
        const cekEmail = await db.select().from(users).where(eq(users.email, email))
        if (cekEmail.length > 0) return response.fail("email sudah di gunakan")
        const hashed = await bcrypt.hash(password, 10)
        await db.insert(users).values({
            name,
            email,
            password: hashed
        })

        return response.success({
            name,
            email,
        }, "register berhasil")
    }
}
