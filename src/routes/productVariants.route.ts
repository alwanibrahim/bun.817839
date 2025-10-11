import Elysia from "elysia";
import { jwtPlugin, requireAuth } from "../middleware/auth";
import { db } from "../db";
import { productVariants } from "../db/schema";
import { response } from "../utils/response";

export const productVariantsRoute = new Elysia({ prefix: '/product-variant'})
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async()=>{
        const data = await db.select().from(productVariants)
        return response.success(data, 'data berhasil')
    })
