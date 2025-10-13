import { db } from "../db";
import { categories } from "../db/schema";
import { response } from "../utils/response";
import {eq} from 'drizzle-orm'
import {z} from 'zod'

export class AffiliateController{

    static createAffiliateCommissionSchema = z.object({
        referrerId: z.number(),
        referredId: z.number(),
        depositId: z.number(),
        commissionAmount: z.number().positive(),
    });

    static updateAffiliateCommissionSchema = AffiliateController.createAffiliateCommissionSchema.partial();

    static async index(){
        const data = await db.select().from(categories)
        return response.success(data, "data berhasil")
    }
    static async store({body, user, set}: any){

    }
    static async update({params, body, set}: any){

    }
    static async destroy({params}: any){
        const id = Number(params.id)
        await db.delete(categories).where(eq(categories.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
