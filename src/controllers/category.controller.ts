import { db } from "../db";
import { categories } from "../db/schema";
import { response } from "../utils/response";
import {z} from 'zod'


export class CategoriyController {

    static createSchema = z.object({
        name: z.string("masukkan kategory name").min(3, "minimal 3 karakter"),
        slug: z.string("masukkan slug ").min(3, "minimal 3 karakter"),
        description: z.string("masukkan slug ").min(3, "minimal 3 karakter").optional()
    })
    static async index(){
        const data = await db.select().from(categories)
        return response.success(data, "data berhasil")
    }
    static async store({body, set}: any){
        const parse = CategoriyController.createSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
            const {name, slug, description} = parse.data

        await db.insert(categories).values({
            name,
            slug,
            description
        })

        return response.success([
            name,
            slug,
            description
        ])
    }
    static async update(){
    }
    static async destroy(){
    }
}
