import { db } from "../db";
import { productInvites } from "../db/schema";
import { response } from "../utils/response";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { redis } from "../redis";

export class ProductInviteController {
  static createProductInviteSchema = z.object({
    productId: z.number().int().positive(),
    inviteLinkOrEmail: z.string().min(1),
    assignedUserId: z.number().optional(),
    status: z.enum(["pending", "clicked", "accepted"]).default("pending"),
    sentAt: z.string().optional(),
    clickedAt: z.string().optional(),
    acceptedAt: z.string().optional(),
  });

  static updateProductInviteSchema =
    ProductInviteController.createProductInviteSchema.partial();

  // ✅ Index (pakai cache)
  static async index() {
    try {
      const cacheKey = "productInvites:latest10";
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("✅ ProductInvites from Redis Cache");
        return response.success(JSON.parse(cached), "data berhasil (cache)");
      }

      const data = await db
        .select()
        .from(productInvites)
        .orderBy(desc(productInvites.id))
        .limit(10);

      await redis.set(cacheKey, JSON.stringify(data), "EX", 60);

      console.log("📦 ProductInvites from Database");
      return response.success(data, "data berhasil (DB)");
    } catch (err: any) {
      console.error("ProductInvite Index Error:", err);
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }

  // ✅ Store
  static async store({ body, set }: any) {
    try {
      const parse = ProductInviteController.createProductInviteSchema.safeParse(body);
      if (!parse.success) {
        return response.fail(
          parse.error.issues.map((e) => e.message).join(", "),
          422
        );
      }

      const data = parse.data;
      const payload = {
  productId: data.productId,
  inviteLinkOrEmail: data.inviteLinkOrEmail,
  assignedUserId: data.assignedUserId ?? null,
  status: data.status ?? "pending",
  sentAt: data.sentAt
    ? new Date(data.sentAt).toISOString().slice(0, 19).replace("T", " ")
    : null,
  clickedAt: data.clickedAt
    ? new Date(data.clickedAt).toISOString().slice(0, 19).replace("T", " ")
    : null,
  acceptedAt: data.acceptedAt
    ? new Date(data.acceptedAt).toISOString().slice(0, 19).replace("T", " ")
    : null,
  createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
  updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
};


      const result = await db.insert(productInvites).values(payload);
      await redis.del("productInvites:latest10");

      return response.success(result, "Product invite berhasil dibuat");
    } catch (err: any) {
      console.error("ProductInvite Store Error:", err);
      set.status = 500;
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }

  // ✅ Update
  static async update({ params, body, set }: any) {
    try {
      const id = Number(params.id);
      const parse = ProductInviteController.updateProductInviteSchema.safeParse(body);

      if (!parse.success) {
        return response.fail(
          parse.error.issues.map((e) => e.message).join(", "),
          422
        );
      }

      const data = parse.data;
      await db.update(productInvites).set(data).where(eq(productInvites.id, id));

      await redis.del("productInvites:latest10");

      return response.success(`Product invite dengan ID ${id} berhasil diperbarui`);
    } catch (err: any) {
      console.error("ProductInvite Update Error:", err);
      set.status = 500;
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }

  // ✅ Destroy
  static async destroy({ params }: any) {
    try {
      const id = Number(params.id);
      await db.delete(productInvites).where(eq(productInvites.id, id));

      await redis.del("productInvites:latest10");

      return response.success(`Product invite dengan ID ${id} berhasil dihapus`);
    } catch (err: any) {
      console.error("ProductInvite Destroy Error:", err);
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }
}
