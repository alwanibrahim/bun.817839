import Elysia from "elysia";
import { z } from 'zod';
import { db } from "../../db";
import { distributions } from "../../db/schema";
import { jwtPlugin, requireAuth } from "../../middleware/auth";
import { response } from "../../utils/response";

const distributionSchema = z.object({
    userId: z.number().int(),
    productId: z.number().int(),
    accountId: z.number().int().optional(),
    inviteId: z.number().int().optional(),
    status: z.enum(["pending", "sent", "completed"]),
    instructionsSent: z.number().int().optional()
})

export const distributionRoute = new Elysia({ prefix: '/distributions' })
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async () => {
        const data = await db.select().from(distributions)
        return response.success(data, 'data berhasil')
    })
    .post('/', async ({ body }) => {
        const parse = distributionSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
        const { accountId, instructionsSent, inviteId, productId, status, userId } = parse.data
        await db.insert(distributions).values({
            accountId,
            productId,
            userId,
            instructionsSent,
            status,
            inviteId
        })

        return response.success({
            accountId,
            productId,
            userId,
            instructionsSent,
            status,
            inviteId
        }, "data berhasil di tambahkan ")
    })
