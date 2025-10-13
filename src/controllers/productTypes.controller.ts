import { db } from "../db";
import { productTypes } from "../db/schema";
import { response } from "../utils/response";
import {z} from 'zod'



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
    static async update(){
    }
    static async destroy(){
    }
}
