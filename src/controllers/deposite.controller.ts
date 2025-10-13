import { db } from "../db";
import { deposits } from "../db/schema";
import { response } from "../utils/response";
import {eq} from 'drizzle-orm'
import {z} from 'zod'

export class DepositeController{
    static createSchema = z.object({
        userId: z.coerce.number().positive("masukkan yang valid"),
        amount: z.coerce.number().positive("masukkan yang valid"),
        status: z.enum(['pending', 'completed', 'failed']).default('pending'),
        reference: z.string(),
        paymentMethod: z.string().default('QRIS'),
        paymentUrl: z.string().optional(),

    })

    static updateDepositSchema = DepositeController.createSchema.partial();
    static async index(){
        const data = await db.select().from(deposits)
        return response.success(data, "data berhasil")
    }
    static async store({body, user, set}: any){

    }
    static async update({params, body, set}: any){

    }
    static async destroy({params}: any){
        const id = Number(params.id)
        await db.delete(deposits).where(eq(deposits.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
