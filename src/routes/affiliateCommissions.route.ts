import Elysia from "elysia";
import { jwtPlugin, requireAuth } from "../middleware/auth";
import { db } from "../db";
import { affiliateCommissions } from "../db/schema";
import { response } from "../utils/response";

export const affiliateCommissionsRoute = new Elysia({prefix: '/commisions'})
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async()=>{
     const data =   await db.select().from(affiliateCommissions)
     return response.success(data, 'data berhasil')
    })
