import Elysia from "elysia";
import { jwtPlugin, requireAuth } from "../middleware/auth";
import { db } from "../db";
import { notifications } from "../db/schema";
import { response } from "../utils/response";

export const notificationRoute = new Elysia({prefix: '/notifications'})
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async()=>{
      const data =  await db.select().from(notifications)
      return response.success(data, 'data berhasil')
    })
