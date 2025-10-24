import { z } from "zod"
import { db } from "../db"
import { products, productVariants, productTypes } from "../db/schema"
import { eq, getTableColumns } from "drizzle-orm"
import {
  ProductResponseSchema,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductDeleteRequest,
  ProductListRequest,
} from "../../../../packages/shared/schema/product"
import { validate } from "../../../../packages/shared/utils/validator"
import { insertWithReturn, updateWithReturn } from "../../../../packages/shared/utils/db-helper"
import {redis} from '../redis'
export class ProductControllerV1 {

  static index = validate(ProductListRequest, async ({ query }) => {
    const cachekey = 'cache:products:v1';
    const cached = await redis.get(cachekey)
    if(cached){
      console.log("data dari cache v1")
      const parsed = JSON.parse(cached)
      return { success: true, data: parsed }
    }
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
      .leftJoin(productVariants, eq(productVariants.productId, products.id))

    // group jadi nested array
    const map = new Map<number, any>()

    for (const row of rows) {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          imageUrl: row.imageUrl,
          typeId: row.typeId,
          categoryId: row.categoryId,
          typeName: row.typeName,
          features: row.features,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          variants: [],
        })
      }

      if (row.variantId) {
        map.get(row.id).variants.push({
          id: row.variantId,
          name: row.variantName,
          price: row.variantPrice,
          duration: row.variantDuration,
        })
      }
    }

    const productsWithVariants = Array.from(map.values())
    const data = z.array(ProductResponseSchema).parse(productsWithVariants)
    const parseddata = JSON.stringify(data)
    await redis.set(cachekey, parseddata, 'EX', 60 * 5) // cache 5 menit  
    

    return { success: true, data }
  })


  static store = validate(ProductCreateRequest, async ({ body }) => {
    const inserted = await insertWithReturn(db, products, body, products.id)
    const data = ProductResponseSchema.parse(inserted)
    return { success: true, message: "Produk berhasil dibuat", data }
  })


  static update = validate(ProductUpdateRequest, async ({ params, body }) => {
    const updated = await updateWithReturn(db, products, products.id, params.id, body)
    if (!updated)
      return { success: false, message: "Produk tidak ditemukan" }

    const data = ProductResponseSchema.parse(updated)
    return { success: true, message: "Produk berhasil diperbarui", data }
  })


  static destroy = validate(ProductDeleteRequest, async ({ params }) => {
    const target = await db.select().from(products).where(eq(products.id, params.id))
    if (target.length === 0)
      return { success: false, message: "Produk tidak ditemukan" }

    await db.delete(products).where(eq(products.id, params.id)).execute()
    return { success: true, message: "Produk berhasil dihapus" }
  })
}
