import Elysia from "elysia";
import { db } from "../db";
import { categories } from "../db/schema";
import { response } from "../utils/response";
import { jwtPlugin, requireAuth } from "../middleware/auth";

export const categoryRoute = new Elysia({prefix: '/categories'})
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async()=>{
    const data =    await db.select().from(categories)
        return response.success(data, "ini dia data nya anjay")
    })

    .post('/', async({body, user, set})=>{

    })
