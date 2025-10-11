import Elysia from "elysia";
import { db } from "../db";
import { deposits } from "../db/schema";
import { response } from "../utils/response";
import { jwtPlugin, requireAuth } from "../middleware/auth";
import {z} from 'zod'
import crypto from 'crypto'
import {eq} from 'drizzle-orm'

const depositeSchema =z.object({
  userId: z.number().int().positive('user id tidak valid'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "amount tidak valid"),
  paymentMethod: z.string().min(2, 'minimal 2 karakter')
})

const generateReferense = () =>{
  return `DEP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
}

export const depositeRoute = new Elysia({prefix: '/deposites'})
    .use(jwtPlugin)
    .derive(requireAuth)
    .get('/', async()=>{
      const data =  await db.select().from(deposits)
      return response.success(data, "data berhasil")
    })
    .post('/', async({body})=>{
      const parse = depositeSchema.safeParse(body)
      if(!parse.success) return response.fail(parse.error.issues.map((e)=> e.message).join(", "), 422)
        const {userId,amount,paymentMethod} = parse.data
      const reference = generateReferense()
      await db.insert(deposits).values({
        userId,
        amount,
        paymentMethod,
        status: "pending",
        reference,
      })

      return response.success({
        reference,
        amount,
        paymentMethod,
        status: "pending",

      }, "data berhasil di buat")
    })

    .delete('/:id', async({params})=>{
      const id = Number(params.id)
     await db.delete(deposits).where(eq(deposits.id, id))
     return response.success(null, `data dengan id ${id} telah di hapus`)

    })
