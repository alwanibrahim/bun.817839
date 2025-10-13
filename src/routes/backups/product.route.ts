import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { products } from "../../db/schema";
import { jwtPlugin, requireAuth } from "../../middleware/auth";
import { response } from "../../utils/response";

export const productSchema = t.Object({
    name: t.String(),
    type: t.String(),
    price: t.Union([t.String(), t.Number()]),
    originalPrice: t.Optional(t.Union([t.String(), t.Number()])),
    description: t.Optional(t.String()),
    imageUrl: t.Optional(t.String()),
    features: t.Optional(t.Array(t.String())),
    categoryId: t.Optional(t.Number())
});

export const updateProductSchema = t.Partial(productSchema)

export const productRoute = new Elysia({ prefix: "/products" })
    .use(jwtPlugin)
    .derive(requireAuth)
    .get("/", async () => {
        const data = await db.select().from(products);
        return response.success(data, "Data produk");
    })
    .onRequest(({ request }) => console.time("Request total"))
    .post(
        "/",
        async ({ body, user, set }) => {

            await db.insert(products).values({
                name: body.name,
                type: body.type as "account" | "invite" | "family",
                price: String(body.price),
                originalPrice: body.originalPrice ? String(body.originalPrice) : null,
                description: body.description ?? null,
                imageUrl: body.imageUrl ?? null,
                features: body.features ?? null,



            });
            return response.success(null, `Produk ${name} berhasil ditambahkan oleh ${user.email}`);
        },
        {
            body: productSchema
        }
    )
    .put('/:id', async ({ params, body, set, user }) => {
        const id = Number(params.id)
        await db.update(products).set({
            name: body.name,
            type: body.type as "account" | "invite" | "family",
            price: String(body.price),
            originalPrice: body.originalPrice ? String(body.originalPrice) : null,
            description: body.description ?? null,
            imageUrl: body.imageUrl ?? null,
            features: body.features ?? null,
        }).where(eq(products.id, id))

        return response.success(null, `data berhasil di update oleh ${user.email}`)
    }, {
        body: updateProductSchema
    })

    .delete('/:id', async ({ params, user }) => {
        const id = Number(params.id)
        if (!id) return response.fail("tidak ada id")
        await db.delete(products).where(eq(products.id, id))
        return response.success(null, `data dengan id ${id} telah di hapus oleh ${user.email}`)
    })

