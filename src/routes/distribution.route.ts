import Elysia from "elysia";
import { jwtPlugin, requireAuth } from "../middleware/auth";
import { db } from "../db";
import { distributions } from "../db/schema";
import { response } from "../utils/response";

export const distributionRoute = new Elysia({prefix: '/distributions'})
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async()=>{
        const data = await db.select().from(distributions)
        return response.success(data, 'data berhasil')
    })
