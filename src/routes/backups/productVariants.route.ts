import Elysia from "elysia";
import { z } from 'zod';
import { db } from "../../db";
import { productVariants } from "../../db/schema";
import { jwtPlugin, requireAuth } from "../../middleware/auth";
import { response } from "../../utils/response";

const productVariantSchema = z.object({
    productId: z.number().int().positive('Id product wajib dan harus valid'),
    name: z.string("masukkan nama atau email product variant").min(3, 'minimal 3 karakter'),
    duration: z.optional(z.string()),
    price: z.coerce.number().positive(),
    originalPrice: z.coerce.number().positive(),
    status: z.enum(["READY", "NOT_READY"]).default("READY"),
})

export const productVariantsRoute = new Elysia({ prefix: '/product-variant' })
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async () => {
        const data = await db.select().from(productVariants)
        return response.success(data, 'data berhasil')
    })
    .post('/', async ({ body, user, set }) => {
        const parse = productVariantSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
        const { name, price, productId, status, duration, originalPrice } = parse.data
        await db.insert(productVariants).values({
            productId,
            name,
            duration,
            price: price.toString(),
            originalPrice: price.toString(),
            status
        })

        return response.success({
            productId,
            name,
            duration,
            price,
            originalPrice,
            status
        }, 'data berhasil')
    })
