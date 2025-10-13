import Elysia from "elysia";
import { z } from 'zod';
import { db } from "../../db";
import { categories } from "../../db/schema";
import { jwtPlugin, requireAuth } from "../../middleware/auth";
import { response } from "../../utils/response";

const categorySchema = z.object({
    name: z.string('nama wajib di isi').min(3, 'minimal 3 karakter'),
    slug: z.string('slug ada yang salah').min(3, 'minimal 3 huruf'),
    description: z.optional(z.string('description ada yang salah').min(5, 'minimal 5 karakter'))

})

export const categoryRoute = new Elysia({ prefix: '/categories' })
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async () => {
        const data = await db.select().from(categories)
        return response.success(data, "ini dia data nya anjay")
    })
    .post('/', async ({ body, user, set }) => {
        const parse = categorySchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
        const { name, slug, description } = parse.data
        await db.insert(categories).values({
            name,
            slug,
            description
        })
        return response.success("data berhasil di tambahkan")

    })
