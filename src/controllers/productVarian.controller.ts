import { db } from "../db";
import { productVariants } from "../db/schema";
import { response } from "../utils/response";
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export class ProductVariantController {
    static createProductVariantSchema = z.object({
        productId: z.number(),
        name: z.string().min(1),
        duration: z.string().optional(),
        price: z.number(),
        originalPrice: z.number().optional(),
        status: z.enum(["READY", "NOT_READY"]).default("READY"),
    });

    static updateProductVariantSchema = ProductVariantController.createProductVariantSchema.partial();
    static async index() {
        const data = await db.select().from(productVariants)
        return response.success(data, "data berhasil")
    }
    static async store({ body, user, set }: any) {
        const parse = ProductVariantController.createProductVariantSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
        const { name, price, productId, status, duration, originalPrice } = parse.data
        await db.insert(productVariants).values({
            name,
            price: price.toString(),
            productId: Number(productId),
            duration,
            originalPrice: originalPrice?.toString(),
            status: "READY", // pastikan schema-nya cocok
        })


    }
    static async update({ params, body, set }: any) {

    }
    static async destroy({ params }: any) {
        const id = Number(params.id)
        await db.delete(productVariants).where(eq(productVariants.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
