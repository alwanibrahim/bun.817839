import Elysia from "elysia";
import { jwtPlugin, requireAuth } from "../middleware/auth";
import { db } from "../db";
import { productAccounts } from "../db/schema";
import { response } from "../utils/response";
import { z } from 'zod'


const productAccountSchema = z.object({
    productId: z.number().int(),
    username: z.string("masukkan email account").min(3, 'minimal 3 karakter'),
    password: z.string("masukkan password nya juga bro..").min(3, 'minimal 3 karakter').optional(),
    isUsed: z.number().int().refine(v => v === 0 || v === 1, { message: "masukkan hanya angka 1 atau 0" }).default(0),

})

export const productAccountsRoute = new Elysia({ prefix: '/product-account' })
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async () => {
        const data = await db.select().from(productAccounts)
        return response.success(data, 'data berhasil')
    })
    .post('/', async ({ body }) => {
        const parse = productAccountSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
        const { isUsed, password, productId, username } = parse.data
        await db.insert(productAccounts).values({
            productId,
            username,
            isUsed,
            password
        })

        return response.success({
            productId,
            username,
            password,
            isUsed,

        }, "data berhasil masook.. pak")
    })
