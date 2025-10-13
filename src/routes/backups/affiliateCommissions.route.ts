import Elysia from "elysia";
import { z } from 'zod';
import { db } from "../../db";
import { affiliateCommissions } from "../../db/schema";
import { jwtPlugin, requireAuth } from "../../middleware/auth";
import { response } from "../../utils/response";

const affiliateSchema = z.object({
    referrerId: z.coerce.number().positive(),
    referredId: z.coerce.number().positive(),
    depositId: z.coerce.number().positive(),
    commissionAmount: z.coerce.number().positive(),

})

export const affiliateCommissionsRoute = new Elysia({ prefix: '/commisions' })
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async () => {
        const data = await db.select().from(affiliateCommissions)
        return response.success(data, 'data berhasil')
    })

    .post('/', async ({ body, user, set }) => {
        const parse = affiliateSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error?.issues.map((e) => e.message).join(", "), 422)

        const { commissionAmount, depositId, referredId, referrerId } = parse.data

        await db.insert(affiliateCommissions).values({
            commissionAmount: commissionAmount.toString(),
            depositId,
            referredId,
            referrerId,
        })
        return response.success({
            commissionAmount,
            depositId,
            referredId,
            referrerId
        })
    })
