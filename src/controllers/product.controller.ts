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

   static async index() {
  const rows = await db
    .select({
      ...getTableColumns(products),
      typeName: productTypes.name,
      variantId: productVariants.id,
      variantName: productVariants.name,
      variantPrice: productVariants.price,
      variantDuration: productVariants.duration,
    })
    .from(products)
    .leftJoin(productTypes, eq(products.typeId, productTypes.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id));

  // 🔁 Grouping hasil agar nested jadi { product: {...}, variants: [...] }
  const data = Object.values(
    rows.reduce((acc, row) => {
      const productId = row.id;
      if (!acc[productId]) {
        acc[productId] = {
          id: row.id,
          name: row.name,
          description: row.description,
          typeName: row.typeName,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          variants: [],
        };
      }
      if (row.variantId) {
        acc[productId].variants.push({
          id: row.variantId,
          name: row.variantName,
          price: row.variantPrice,
          duration: row.variantDuration,
        });
      }
      return acc;
    }, {} as Record<number, any>)
  );

  return response.success(data, "Data produk berhasil diambil");
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
