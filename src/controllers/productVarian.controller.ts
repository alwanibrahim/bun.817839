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
        price: z.coerce.number(),
        originalPrice: z.coerce.number().optional(),
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

        return response.success({
            name,
            price,
            productId,
            duration,
            originalPrice,
            status
        }, "data berhasil") 


    }
    static async update({ params, body }: any) {
        const id = Number(params.id);

        const existing = await db.query.productVariants.findFirst({
            where: eq(productVariants.id, id),
        });
        if (!existing) return response.fail("Data tidak ditemukan", 404);

        const parsed = ProductVariantController.updateProductVariantSchema.safeParse(body);
        if (!parsed.success)
            return response.fail(parsed.error.issues.map(e => e.message).join(", "), 422);

        const data = parsed.data;

        await db.update(productVariants)
            .set({
                name: data.name ?? existing.name,
                price: data.price?.toFixed(2), 
                productId: data.productId ?? existing.productId,
                duration: data.duration ?? existing.duration,
                originalPrice: data.originalPrice?.toFixed(2),
                status: data.status ?? existing.status,
            })
            .where(eq(productVariants.id, id));

        return response.success(
            {
                ...existing,
                ...data,
            },
            "Data berhasil diupdate"
        );
    }

    static async destroy({ params }: any) {
        const id = Number(params.id)
        await db.delete(productVariants).where(eq(productVariants.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
