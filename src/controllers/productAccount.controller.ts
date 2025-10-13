import { db } from "../db";
import { productAccounts } from "../db/schema";
import { response } from "../utils/response";
import {eq} from 'drizzle-orm'
import { z } from 'zod'

export class ProductAccountController{
    static createProductAccountSchema = z.object({
        productId: z.number(),
        username: z.string().min(1),
        password: z.string().default("masuk123"),
        isUsed: z.number().default(0),
    });
    static updateProductAccountSchema = ProductAccountController.createProductAccountSchema.partial();
    static async index(){
        const data = await db.select().from(productAccounts)
        return response.success(data, "data berhasil")
    }
    static async store({body, user, set}: any){

    }
    static async update({params, body, set}: any){

    }
    static async destroy({params}: any){
        const id = Number(params.id)
        await db.delete(productAccounts).where(eq(productAccounts.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
