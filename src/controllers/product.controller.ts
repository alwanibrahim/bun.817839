import { z } from 'zod'
import { db } from '../db'
import { products, productTypes, productVariants } from '../db/schema'
import { response } from '../utils/response'
import { redis } from '../redis'

import { eq, getTableColumns } from 'drizzle-orm'
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
    const cacheKey = 'cache:products';
    const cached = await redis.get(cacheKey)
    if (cached) {
      console.log("data dari cache")
      const parsed = JSON.parse(cached)
      return response.success(parsed, "data dari product real")

    }

    const rows = await db
      .select({
        ...getTableColumns(products),
        typeId: products.typeId,
        variantId: productVariants.id,
        variantName: productVariants.name,
        variantPrice: productVariants.price,
        variantDuration: productVariants.duration,
      })
      .from(products)
      .leftJoin(productTypes, eq(products.typeId, productTypes.id))
      .leftJoin(productVariants, eq(productVariants.productId, products.id));

    // 3️⃣ Grouping manual ke bentuk nested
    const data = Object.values(
      rows.reduce((acc, row) => {
        const productId = row.id;
        if (!acc[productId]) {
          acc[productId] = {
            id: row.id,
            name: row.name,
            description: row.description,
            typeId: row.typeId,
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

    const parsedata = JSON.stringify(data)
    await redis.set(cacheKey, parsedata, 'EX', 60 * 5) // cache 5 menit
    console.log("data dari db")
    return response.success(data, "data dari ini dari product real")
  }


  static async store({ body, user }: any) {
    console.log("BODY MASUK:", body)
    const parse = ProductController.createSchema.safeParse(body)
    if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
    const { name, categoryId, description, features, imageUrl, typeId } = parse.data

    const [inserted] = await db.insert(products).values({
      name,
      typeId,
      categoryId,
      features: features ?? null,
      imageUrl: imageUrl?.toString(),
      description,
    })
    await redis.del('cache:product')


    return response.success({
      name,
      categoryId,
      features,
      imageUrl,
      description,
    }, "data berhasil")
  }
  static async update({ params, body }: any) {
  const id = Number(params.id);
  if (!id) return response.fail("ID produk tidak valid", 400);

  const parse = ProductController.updateProductSchema.safeParse(body);
  if (!parse.success) {
    return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422);
  }

  const updateData = parse.data;

  // ✅ Pastikan produk ada
  const [existing] = await db.select().from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!existing) return response.fail("Produk tidak ditemukan", 404);

  // ✅ Eksekusi update
 const [updated] = await db.update(products)
    .set(updateData)
    .where(eq(products.id, id));

  // ✅ Bersihkan cache
  await redis.del("cache:products");

  return response.success({
    updated
  }, "Produk berhasil diupdate");
  }

 static async destroy({ params }: any) {
  const id = Number(params.id);
  if (!id) return response.fail("ID produk tidak valid", 400);

  await db.delete(products).where(eq(products.id, id));

  // Bersihkan cache
  await redis.del("cache:products");

  return response.success(null, "Produk berhasil dihapus");
}

}
