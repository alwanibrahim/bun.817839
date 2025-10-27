import { db } from "../db";
import { categories } from "../db/schema";
import { response } from "../utils/response";
import {z} from 'zod'
import {eq} from 'drizzle-orm'
import {redis} from '../redis'


export class CategoriyController {

    static createSchema = z.object({
        name: z.string("masukkan kategory name").min(3, "minimal 3 karakter"),
        slug: z.string("masukkan slug ").min(3, "minimal 3 karakter"),
        description: z.string("masukkan slug ").min(3, "minimal 3 karakter").optional()
    })
    static async index(){
        const cachekeys = 'cache:categories';
        const cached = await redis.get(cachekeys)
        if (cached) {
          console.log("data dari cache category")
          const parsed = JSON.parse(cached)
          return response.success(parsed, "data dari category real")
    
        }
        const data = await db.select().from(categories)
        await redis.set(cachekeys, JSON.stringify(data),'EX',  60 * 60 ) // 1 jam  
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

        await redis.del('cache:categories') // menghapus cache setelah data berubah


        return response.success([
            name,
            slug,
            description
        ])
    }
    static async update({params, body}: any){
        const id = Number(params.id)
        const parse = CategoriyController.createSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
            const {name, slug, description} = parse.data

        await db.update(categories).set({
            name,
            slug,
            description
        }).where(eq(categories.id, id))

        await redis.del('cache:categories') // menghapus cache setelah data berubah

        return response.success([
            name,
            slug,
            description
        ])
    }
    static async destroy({params}: any){
        const id = Number(params.id)
        await db.delete(categories).where(eq(categories.id, id))
        await redis.del('cache:categories') // menghapus cache setelah data berubah
        return response.success(null, "kategori berhasil dihapus")
    }
}
