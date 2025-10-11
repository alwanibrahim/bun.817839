import Elysia from "elysia";
import { jwtPlugin, requireAuth } from "../middleware/auth";
import { db } from "../db";
import { users } from "../db/schema";
import { response } from "../utils/response";

export const userRoute = new Elysia({prefix: '/user'})
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async()=>{
        const data = await db.select().from(users)
        return response.success(data, "data berhasil")
    })
