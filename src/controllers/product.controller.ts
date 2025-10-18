import {z} from 'zod'
import { db } from '../db'
import { products, productTypes, productVariants } from '../db/schema'
import { response } from '../utils/response'
import {eq, getTableColumns} from 'drizzle-orm'
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
        const productList = await db
            .select({
              ...getTableColumns(products),
              typeName: productTypes.name
            })
            .from(products)
            .leftJoin(productTypes, eq(products.typeId, productTypes.id))

        // Ambil semua variant
        const variants = await db.select().from(productVariants)

        // Gabungkan manual
        const data = productList.map(p => ({
            ...p,
            variants: variants.filter(v => v.productId === p.id),
        }))

        return response.success(data, "Data produk berhasil diambil")
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
