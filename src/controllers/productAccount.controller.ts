import { db } from "../db";
import { productAccounts } from "../db/schema";
import { response } from "../utils/response";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { redis } from "../redis";

export class ProductAccountController {
  static createProductAccountSchema = z.object({
    productId: z.number().int().positive(),
    username: z.string().min(1),
    password: z.string().default("masuk123"),
    isUsed: z.number().min(0).max(1).default(0),
  });

  static updateProductAccountSchema =
    ProductAccountController.createProductAccountSchema.partial();

  // ✅ Index (pakai cache)
  static async index() {
    try {
      const cacheKey = "productAccounts:latest10";
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("✅ ProductAccounts from Redis Cache");
        return response.success(JSON.parse(cached), "data berhasil (cache)");
      }

      const data = await db
        .select()
        .from(productAccounts)
        .orderBy(desc(productAccounts.id))
        .limit(10);

      await redis.set(cacheKey, JSON.stringify(data), "EX", 60);

      console.log("📦 ProductAccounts from Database");
      return response.success(data, "data berhasil (DB)");
    } catch (err: any) {
      console.error("ProductAccount Index Error:", err);
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }

  // ✅ Store
  static async store({ body, set }: any) {
    try {
      const parse = ProductAccountController.createProductAccountSchema.safeParse(body);
      if (!parse.success) {
        return response.fail(
          parse.error.issues.map((e) => e.message).join(", "),
          422
        );
      }

      const data = parse.data;
     const payload = {
  productId: data.productId,
  username: data.username,
  password: data.password ?? "masuk123",
  isUsed: data.isUsed ?? 0,

};


      const result = await db.insert(productAccounts).values(payload);

      await redis.del("productAccounts:latest10");

      return response.success(result, "Akun produk berhasil dibuat");
    } catch (err: any) {
      console.error("ProductAccount Store Error:", err);
      set.status = 500;
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }

  // ✅ Update
  static async update({ params, body, set }: any) {
    try {
      const id = Number(params.id);
      const parse = ProductAccountController.updateProductAccountSchema.safeParse(body);

      if (!parse.success) {
        return response.fail(
          parse.error.issues.map((e) => e.message).join(", "),
          422
        );
      }

      const data = parse.data;
      await db.update(productAccounts).set(data).where(eq(productAccounts.id, id));

      await redis.del("productAccounts:latest10");

      return response.success(`Akun dengan ID ${id} berhasil diperbarui`);
    } catch (err: any) {
      console.error("ProductAccount Update Error:", err);
      set.status = 500;
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }

  // ✅ Destroy
  static async destroy({ params }: any) {
    try {
      const id = Number(params.id);
      await db.delete(productAccounts).where(eq(productAccounts.id, id));

      await redis.del("productAccounts:latest10");

      return response.success(`Akun dengan ID ${id} berhasil dihapus`);
    } catch (err: any) {
      console.error("ProductAccount Destroy Error:", err);
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }
}
