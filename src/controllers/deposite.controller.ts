import { db } from "../db";
import { deposits, users, affiliateCommissions } from "../db/schema";
import { response } from "../utils/response";
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'
import crypto from 'crypto'
import {redis} from '../redis'
export class DepositeController {
    static createSchema = z.object({
        userId: z.coerce.number().positive("masukkan yang valid"),
        amount: z.coerce.number().positive("masukkan yang valid"),
        status: z.enum(['pending', 'completed', 'failed']).default('pending'),
        reference: z.string(),
        paymentMethod: z.string().default('QRIS'),
        paymentUrl: z.string().optional(),

    })

    static createDepositSchema = z.object({
        amount: z.number().min(1000, "Minimal deposit 1000"),
        returnUrl: z.string().url().optional(),
        callbackUrl: z.string().url().optional(),
    });

    static updateDepositSchema = DepositeController.createSchema.partial();
     static async index() {
    try {
      const cacheKey = "deposits:latest5";

      // 🔹 1. Coba ambil dari cache dulu
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("✅ From Redis Cache");
        return response.success(JSON.parse(cached), "Data berhasil (cache)");
      }

      // 🔹 2. Kalau gak ada di cache, ambil dari DB
      const data = await db
        .select()
        .from(deposits)
        .orderBy(desc(deposits.id))
        .limit(5);

      // 🔹 3. Simpan ke Redis (expired 60 detik)
      await redis.set(cacheKey, JSON.stringify(data), "EX", 60);

      console.log("📦 From Database");
      return response.success(data, "Data berhasil (DB)");
    } catch (err: any) {
      console.error("Deposit Index Error:", err);
      return response.fail(err?.message ?? "Internal Server Error", 500);
    }
  }

    static async store({ body, user, set }: any) {
        try {
            // ✅ 1. Validasi input
            const parse = DepositeController.createDepositSchema.safeParse(body);
            if (!parse.success) {
                return response.fail(parse.error.issues.map(e => e.message).join(", "), 422);
            }

            const { amount, callbackUrl, returnUrl } = parse.data;
            const userId = user?.id;
            if (!userId) {
                set.status = 401;
                return response.fail("Unauthorized / user tidak valid", 401);
            }

            // ✅ 2. Siapkan kredensial Tripay
            const merchantCode = process.env.TRIPAY_MERCHANT!;
            const privateKey = process.env.TRIPAY_PRIVATE_KEY!;
            const apiKey = process.env.TRIPAY_API_KEY!;
            const baseUrl = process.env.TRIPAY_BASE_URL!;
            const merchantRef = `DEP-${userId}-${Date.now()}`;

            const signature = crypto
                .createHmac("sha256", privateKey)
                .update(merchantCode + merchantRef + amount)
                .digest("hex");

            // ✅ 3. Simpan deposit awal ke DB
            await db.insert(deposits).values({
                userId,
                amount: amount.toString(),
                status: "pending",
                reference: merchantRef,
                paymentMethod: "QRIS",
            });

            // ✅ 4. Ambil ulang deposit ID berdasarkan reference (karena insertId nggak ada di Drizzle)
            const [deposit] = await db
                .select()
                .from(deposits)
                .where(eq(deposits.reference, merchantRef));

            if (!deposit) {
                throw new Error("Gagal mengambil deposit yang baru dibuat");
            }

            const depositId = deposit.id;

            // ✅ 5. Panggil Tripay API
            const tripayResponse = await fetch(`${baseUrl}/transaction/create`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    method: "QRIS",
                    merchant_ref: merchantRef,
                    amount,
                    customer_name: user.name,
                    customer_email: user.email,
                    customer_phone: user.phone ?? "081111111111",
                    order_items: [
                        {
                            sku: `DEP-${depositId}`,
                            name: "Deposit Saldo",
                            price: amount,
                            quantity: 1,
                        },
                    ],
                    return_url: returnUrl ?? null,
                    callback_url: callbackUrl ?? null,
                    expired_time: Math.floor(Date.now() / 1000) + 60 * 60, // 1 jam
                    signature,
                }),
            });

            // ✅ 6. Baca respons Tripay
            const tripayRaw = await tripayResponse.json();
            console.log("🔍 FULL TRIPAY RESPONSE:", JSON.stringify(tripayRaw, null, 2));

            // ✅ 7. Ambil qr_url atau checkout_url
            const qrUrl = tripayRaw?.data?.qr_url || tripayRaw?.data?.checkout_url || null;
            console.log("✅ QR URL FOUND:", qrUrl);

            // ✅ 8. Update DB hanya kalau qrUrl valid
            if (qrUrl) {
                await db
                    .update(deposits)
                    .set({ paymentUrl: qrUrl })
                    .where(eq(deposits.reference, merchantRef)); // pakai reference karena lebih aman
            }

            // ✅ 9. Return ke client
            return response.success(
                {
                    message: "Deposit berhasil dibuat",
                    deposit: {
                        id: depositId,
                        reference: merchantRef,
                        amount,
                        paymentUrl: qrUrl,
                    },
                    tripay: tripayRaw?.data ?? null,
                },
                "Deposit created"
            );
        } catch (err: any) {
            console.error("Deposit Error:", err);
            set.status = 500;
            return response.fail(err?.message ?? "Internal Server Error", 500);
        }
    }

    static async update({ params, body, set }: any) {

    }

    static async destroy({ params }: any) {
        const id = Number(params.id)
        await db.delete(deposits).where(eq(deposits.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
