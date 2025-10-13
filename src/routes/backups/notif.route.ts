import { eq } from 'drizzle-orm';
import Elysia from "elysia";
import { z } from 'zod';
import { db } from "../../db";
import { notifications } from "../../db/schema";
import { jwtPlugin, requireAuth } from "../../middleware/auth";
import { response } from "../../utils/response";

const notifSchema = z.object({
  userId: z.number().int(),
  title: z.string('masukkan title').min(3, 'masukkan minimal 3 karakter'),
  message: z.string("masukkan message"),
  type: z.enum(["system", "admin"])
})

export const notificationRoute = new Elysia({ prefix: '/notifications' })
  .use(jwtPlugin)
  .derive(requireAuth)
  .get('/', async () => {
    const data = await db.select().from(notifications)
    return response.success(data, 'data berhasil')
  })
  .post('/', async ({ body }) => {
    const parse = notifSchema.safeParse(body)
    if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
    const { message, title, userId, type } = parse.data

    await db.insert(notifications).values({
      message,
      title,
      userId,
      isRead: 0,
      type
    })

    return response.success({
      message,
      title,
      userId,
      type
    }, "data berhasil di tambah")
  })

  .delete('/:id', async ({ params }) => {
    const id = Number(params.id)
    await db.delete(notifications).where(eq(notifications.id, id))
    return response.success(null, `data dengan id ${id} telah di hapus`)
  })
