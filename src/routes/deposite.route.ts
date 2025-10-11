import Elysia from "elysia";
import { db } from "../db";
import { deposits } from "../db/schema";
import { response } from "../utils/response";
import { jwtPlugin, requireAuth } from "../middleware/auth";

export const depositeRoute = new Elysia({prefix: '/deposites'})
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async()=>{
      const data =  await db.select().from(deposits)
      return response.success(data, "data berhasil")
    })
