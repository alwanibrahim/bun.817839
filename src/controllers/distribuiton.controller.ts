import { db } from "../db";
import { distributions } from "../db/schema";
import { response } from "../utils/response";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { redis } from "../redis";

export class DistributionController {
  // ✅ Validasi schema
  static createDistributionSchema = z.object({
    userId: z.number().int().positive(),
    productId: z.number().int().positive(),
    accountId: z.number().int().optional(),
    inviteId: z.number().int().optional(),
    status: z.enum(["pending", "sent", "completed"]).default("pending"),
    instructionsSent: z.number().int().min(0).max(1).default(0),
  });

  static updateDistributionSchema =
    DistributionController.createDistributionSchema.partial();

  // ✅ Ambil semua data (cache)
  static async index() {
    try {
      const cacheKey = "distributions:latest10";

      // 🔹 1. Coba ambil dari cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("✅ From Redis Cache");
        return response.success(JSON.parse(cached), "Data berhasil (cache)");
      }

      // 🔹 2. Ambil dari DB (limit 10 terbaru)
      const data = await db
        .select()
        .from(distributions)
        .orderBy(desc(distributions.id))
        .limit(10);

      // 🔹 3. Simpan ke Redis 60 detik
      await redis.set(cacheKey, JSON.stringify(data), "EX", 60);
      console.log("📦 From Database");

      return response.success(data, "Data berhasil (DB)");
    } catch (err: any) {
      console.error("Distribution Index Error:", err);
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }

  // ✅ Tambah data baru
  static async store({ body, user, set }: any) {
    try {
      // 🔹 Validasi body
      const parse = DistributionController.createDistributionSchema.safeParse(body);
      if (!parse.success) {
        return response.fail(
          parse.error.issues.map((e) => e.message).join(", "),
          422
        );
      }

      const data = parse.data;

      // 🔹 Insert ke database
      const result = await db.insert(distributions).values({
        userId: data.userId,
        productId: data.productId,
        accountId: data.accountId ?? null,
        inviteId: data.inviteId ?? null,
        status: data.status,
        instructionsSent: data.instructionsSent,
      });

      // 🔹 Hapus cache lama biar gak basi
      await redis.del("distributions:latest10");

      return response.success(result, "Distribusi berhasil dibuat");
    } catch (err: any) {
      console.error("Distribution Store Error:", err);
      set.status = 500;
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }

  // ✅ Update data
  static async update({ params, body, set }: any) {
    try {
      const id = Number(params.id);
      const parse = DistributionController.updateDistributionSchema.safeParse(body);

      if (!parse.success) {
        return response.fail(
          parse.error.issues.map((e) => e.message).join(", "),
          422
        );
      }

      const data = parse.data;

      await db
        .update(distributions)
        .set(data)
        .where(eq(distributions.id, id));

      // 🔹 Hapus cache lama
      await redis.del("distributions:latest10");

      return response.success(`Data dengan ID ${id} berhasil diperbarui`);
    } catch (err: any) {
      console.error("Distribution Update Error:", err);
      set.status = 500;
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }

  // ✅ Hapus data
  static async destroy({ params }: any) {
    try {
      const id = Number(params.id);
      await db.delete(distributions).where(eq(distributions.id, id));

      // 🔹 Hapus cache lama
      await redis.del("distributions:latest10");

      return response.success(`Data dengan ID ${id} berhasil dihapus`);
    } catch (err: any) {
      console.error("Distribution Destroy Error:", err);
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }
}
