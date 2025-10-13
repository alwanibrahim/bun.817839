import { db } from "../db";
import { productAccounts } from "../db/schema";
import { response } from "../utils/response";
import {eq} from 'drizzle-orm'

export class ProductAccountController{
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
