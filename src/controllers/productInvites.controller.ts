import { db } from "../db";
import { productInvites } from "../db/schema";
import { response } from "../utils/response";
import {eq} from 'drizzle-orm'
import { z } from 'zod'

export class ProductInvitController{
    static createProductInviteSchema = z.object({
        productId: z.number(),
        inviteLinkOrEmail: z.string().min(1),
        assignedUserId: z.number().optional(),
        status: z.enum(["pending", "clicked", "accepted"]).default("pending"),
        sentAt: z.string().optional(),
        clickedAt: z.string().optional(),
        acceptedAt: z.string().optional(),
    });
    static updateProductInviteSchema = ProductInvitController.createProductInviteSchema.partial();

    static async index(){
        const data = await db.select().from(productInvites)
        return response.success(data, "data berhasil")
    }
    static async store({body, user, set}: any){

    }
    static async update({params, body, set}: any){

    }
    static async destroy({params}: any){
        const id = Number(params.id)
        await db.delete(productInvites).where(eq(productInvites.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
