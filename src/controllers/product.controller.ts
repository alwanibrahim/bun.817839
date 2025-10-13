import {z} from 'zod'
import { db } from '../db'
import { products } from '../db/schema'
import { response } from '../utils/response'
export class ProductController {
    static createSchema = z.object({
        name: z.string('masukkan nama product'),
        typeId: z.coerce.number().int({ message: "typeId wajib diisi dan harus angka" }),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        features: z.array(z.string()).optional().nullable().catch(null),
        categoryId: z.number().optional()
    })

    static updateProductSchema = ProductController.createSchema.partial();

    static async index(){
        const data = await db.select().from(products)
        return response.success(data, "data berhasil")
    }

    static async store({body, user}: any){
        console.log("BODY MASUK:", body)
        const parse = ProductController.createSchema.safeParse(body)
        if(!parse.success) return response.fail(parse.error.issues.map((e)=> e.message).join(", "), 422)
            const {name, categoryId, description, features, imageUrl, typeId}= parse.data

        await db.insert(products).values({
            name,
            typeId,
            categoryId,
            features: features ?? null,
            imageUrl: imageUrl?.toString(),
            description,
        })

        return response.success({
            name,
            categoryId,
            features,
            imageUrl,
            description,
        }, "data berhasil")
    }
    static async update(){

    }
    static async destroy(){

    }
}
