import { db } from "../db";
import { distributions } from "../db/schema";
import { response } from "../utils/response";
import {eq} from 'drizzle-orm'
import {z} from 'zod'

export class DistributionController{
    static createDistributionSchema = z.object({
        userId: z.number().int().positive(), // wajib
        productId: z.number().int().positive(), // wajib
        accountId: z.number().int().optional(), // bisa null
        inviteId: z.number().int().optional(), // bisa null
        status: z.enum(["pending", "sent", "completed"]).default("pending"),
        instructionsSent: z.number().int().min(0).max(1).default(0), // tinyint (0/1)
    });
    static updateDistributionSchema = DistributionController.createDistributionSchema.partial();
    
    static async index(){
        const data = await db.select().from(distributions)
        return response.success(data, "data berhasil")
    }
    static async store({body, user, set}: any){

    }
    static async update({params, body, set}: any){

    }
    static async destroy({params}: any){
        const id = Number(params.id)
        await db.delete(distributions).where(eq(distributions.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
