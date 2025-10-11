import Elysia from "elysia";
import { jwtPlugin, requireAuth } from "../middleware/auth";
import { db } from "../db";
import { productAccounts } from "../db/schema";
import { response } from "../utils/response";

export const productInvitesRoute = new Elysia({ prefix: '/product-invites'})
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async()=>{
        const data = await db.select().from(productAccounts)
        return response.success(data, 'data berhasil')
    })
