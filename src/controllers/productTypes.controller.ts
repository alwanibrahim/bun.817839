import { param } from "drizzle-orm";
import { db } from "../db";
import { productTypes } from "../db/schema";
import { response } from "../utils/response";
import {z} from 'zod'
import {eq} from 'drizzle-orm'



export class ProductTypeController {
    static createSchema = z.object({
        name: z.string("masukkan nama").min(3, "minimal 3 karakter"),
        slug: z.string("masukkan slug").min(3, "minimal 3 karakter"),
        description: z.string("masukkan slug").min(3, "minimal 3 karakter").optional()
    })

    static updateProductTypeSchema = ProductTypeController.createSchema.partial();

    static async index(){
        const data = await db.select().from(productTypes)
        return response.success(data, "data berhasil")
    }
    static async store({body, user}: any){
        const parse = ProductTypeController.createSchema.safeParse(body)
        if(!parse.success) return response.fail(parse.error.issues.map((e)=> e.message).join(", "), 422)
            const {name, slug, description, } = parse.data

       await db.insert(productTypes).values({
            name,
            slug,
            description
        })

        return response.success({
            name,
            slug,
            description
        }, "data behasil")

    }
    static async update({params, body}: any){
        const id = Number(params.id)
        const [existing] =await  db.select().from(productTypes).where(eq(productTypes.id, id)).limit(1)
        if(!existing) return response.fail("data tidak di temukan", 404)
        const parse = ProductTypeController.updateProductTypeSchema.safeParse(body)
        if(!parse.success) return response.fail(parse.error.issues.map((e)=>e.message).join(", "), 422)
            const {name, description, slug} = parse.data
        await db.update(productTypes).set({
            name: name, 
            description: description, 
            slug: slug
        }).where(eq(productTypes.id, id))

        return response.success({
            id: id, 
            name: name, 
            description: description, 
            slug: slug, 
            createdAt: Date.now(), 
            updatedAt: Date.now() 

        })
    }
    static async destroy({params}: any){
        const id = Number(params.id)
        if(!id) return response.fail("masukkan id dengan benar")
        await db.delete(productTypes).where(eq(productTypes.id, id))
        return response.success(`data dengan id : ${id} berhasil di hapus`)
    }
}
