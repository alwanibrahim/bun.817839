import { db } from "../db";
import { deposits } from "../db/schema";
import { response } from "../utils/response";
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import crypto from 'crypto'
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
        const data = await db.select().from(deposits)
        return response.success(data, "data berhasil")
    }
    static async store({ body, user, set }: any) {
        try {

            const parse = DepositeController.createDepositSchema.safeParse(body);
            if (!parse.success) {
                return response.fail(
                    parse.error.issues.map((e) => e.message).join(", "),
                    422
                );
            }

            const { amount, callbackUrl, returnUrl } = parse.data;
            const userId = user?.id;

            if (!userId) {
                set.status = 401;
                return response.fail("Unauthorized / user tidak valid", 401);
            }


            const merchantCode = process.env.TRIPAY_MERCHANT!;
            const privateKey = process.env.TRIPAY_PRIVATE_KEY!;
            const apiKey = process.env.TRIPAY_API_KEY!;
            const baseUrl = process.env.TRIPAY_BASE_URL!;
            const merchantRef = `DEP-${userId}-${Date.now()}`;


            const signature = crypto
                .createHmac("sha256", privateKey)
                .update(merchantCode + merchantRef + amount)
                .digest("hex");

            const result = await db
                .insert(deposits)
                .values({
                    userId,
                    amount: amount.toString(),
                    status: "pending",
                    reference: merchantRef,
                    paymentMethod: "QRIS",
                });

            const depositId = (result as any).insertId;

        


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
                    expired_time: Math.floor(Date.now() / 1000) + 60 * 60,
                    signature,
                }),
            });

            const tripay = await tripayResponse.json();


            const qrUrl = tripay?.data?.qr_url;
            if (qrUrl) {
                await db
                    .update(deposits)
                    .set({ paymentUrl: qrUrl })
                    .where(eq(deposits.id, depositId));
            }


            return response.success(
                {
                    message: "Deposit berhasil dibuat",
                    deposit: { ...result, paymentUrl: qrUrl ?? null },
                    tripay,
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
