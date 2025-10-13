import Elysia from "elysia";
import { z } from 'zod';
import { db } from "../../db";
import { productInvites } from "../../db/schema";
import { jwtPlugin, requireAuth } from "../../middleware/auth";
import { response } from "../../utils/response";

const productInviteSchema = z.object({
    productId: z.number().int(),
    inviteLinkOrEmail: z.string('invite link or email wajib').min(3, 'minimal 3 karakter'),
    assignedUserId: z.number().int().optional(),
    status: z.enum(["pending", "clicked", "accepted"]).default("pending"),
    sentAt: z.string().optional()

})

export const productInvitesRoute = new Elysia({ prefix: '/product-invites' })
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async () => {
        const data = await db.select().from(productInvites)
        return response.success(data, 'data berhasil')
    })
    .post('/', async ({ body }) => {
        const parse = productInviteSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
        const { inviteLinkOrEmail, productId, status, assignedUserId, sentAt } = parse.data
        await db.insert(productInvites).values({
            productId,
            inviteLinkOrEmail,
            assignedUserId,
            status,
            sentAt
        })

        return response.success({
            productId,
            inviteLinkOrEmail,
            assignedUserId,
            status,
            sentAt
        }, "data berhasil masuk")
    })
