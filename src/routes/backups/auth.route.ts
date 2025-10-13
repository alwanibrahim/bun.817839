import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'
import { z } from 'zod'
import { db } from '../../db'
import { users } from '../../db/schema'
import { jwtPlugin, requireAuth } from '../../middleware/auth'
import { response } from '../../utils/response'


const registerSchema = z.object({
    name: z.string("masukkan nama dengan benar").min(3, "minimal 3 karakter"),
    email: z.string("masukkan email degan benar").email(),
    password: z.string("masukkan password dengan benar").min(6, "minimal 6 karakter")
})
const loginSchema = z.object({
    email: z.string("masukkan email degan benar").email(),
    password: z.string("masukkan password dengan benar").min(6, "minimal 6 karakter")
})

type registerInput = z.infer<typeof registerSchema>
type loginInput = z.infer<typeof registerSchema>

export const authRoute = new Elysia({ prefix: "/auth" })
    .use(jwtPlugin)
    .post("/register", async ({ body }) => {
        const parse = registerSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
        const { name, email, password } = parse.data
        const data = await db.select().from(users).where(eq(users.email, email))
        if (data.length > 0) return response.fail("email sudah di gunakan")
        const hashed = await bcrypt.hash(password, 10)
        await db.insert(users).values({
            name: name,
            email: email,
            password: hashed
        })
        return response.success({
            name: name,
            email: email,
            password: "***"
        }, "register berhasil")
    })

    .post("/login", async ({ body, jwt }) => {
        const parse = loginSchema.safeParse(body)
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
    })

    .group("/private", (app) =>
        app
            .derive(requireAuth)
            .get("/me", async ({ user }) => {
                const [data] = await db
                    .select()
                    .from(users)
                    .where(eq(users.id, Number(user.id)));

                if (!data) return response.fail("User tidak ditemukan", 404);

                const { password, ...safeUser } = data;
                return response.success(safeUser, "Data user ditemukan");
            })
    );
