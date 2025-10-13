import {z} from 'zod'
import { db } from '../db'
import { products } from '../db/schema'
import { response } from '../utils/response'
export class ProductController {
    static createSchema = z.object({
        name: z.string('masukkan nama product'),
        type: z.enum(["account", "invite", "family"]),
        price: z.coerce.number().positive(),
        originalPrice: z.coerce.number().positive().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        features: z.array(z.string()).optional(),
        categoryId: z.number().optional()
    })

    static async index(){
        const data = await db.select().from(products)
        return response.success(data, "data berhasil")
    }

    static async store({body, user}: any){
        const parse = ProductController.createSchema.safeParse(body)
        if(!parse.success) return response.fail(parse.error.issues.map((e)=> e.message).join(", "), 422)
            const {name, originalPrice, price, type, categoryId, description, features, imageUrl}= parse.data

        await db.insert(products).values({
            name,
            price: price.toString(),
            type,
            categoryId,
            features: features ?? null,
            imageUrl: imageUrl?.toString(),
            description,
            originalPrice: price.toString()
        })

        return response.success({
            name,
            price,
            type,
            categoryId,
            features,
            imageUrl,
            description,
            originalPrice
        }, "data berhasil")
    }
    static async update(){

    }
    static async destroy(){

    }
}
