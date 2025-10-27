import { z } from 'zod'
import { response } from '../utils/response'
import { db } from '../db'
import { users, otpCodes } from '../db/schema'
import { eq, and,desc, sql, lte, gt } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";
import {redis} from '../redis'


const BREVO_API_KEY = process.env.BREVO_API_KEY!;
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey = BREVO_API_KEY;
const brevo = new SibApiV3Sdk.TransactionalEmailsApi();
const resendOtpSchema = z.object({
    type: z.enum(["email", "sms"]).default("email"),
});

function isExpired(otp: any) {
    if (!otp.expiresAt) return true;
    return new Date(otp.expiresAt).getTime() <= Date.now(); // <= biar waktu sama tetap valid
}

// Zod schema validasi body
const verifyOtpSchema = z.object({
    code: z.string().length(6, "Kode OTP harus 6 digit"),
});


export class AuthController {

    static registerSchema = z.object({
        name: z.string().min(3, "Nama minimal 3 karakter"),
        email: z.string().email("Format email tidak valid"),
        password: z.string().min(6, "Password minimal 6 karakter"),
        referredCode: z.string().optional(),
    });

    static loginSchema = z.object({
        email: z.string("masukkan email degan benar").email(),
        password: z.string("masukkan password dengan benar").min(6, "minimal 6 karakter")
    })

    static async login({ body, jwt }: any) {
        const parse = AuthController.loginSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
        const { email, password } = parse.data
        const data = await db.select().from(users).where(eq(users.email, email))
        if (data.length === 0) return response.fail("data tidak di temukan silahkan register")
        const user = data[0]
        const isValid = await bcrypt.compare(password, data[0].password)
        if (!isValid) return response.fail("password salah", 401)
        const newSessionKey = (Number(user.sessionKey) || 0) + 1;
        await db.update(users).set({ sessionKey: newSessionKey }).where(eq(users.id, user.id))

        const token = await jwt.sign({
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
            role: data[0].role,
            sessionKey: newSessionKey
        })

      

        return response.success({
            token, user: {
                id: data[0].id,
                name: data[0].name
            }
        }, "login berhasil")


    }
    static async register({ body, set }: any) {
        const parse = AuthController.registerSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)

        const { email, name, password, referredCode } = parse.data
        const cekEmail = await db.select().from(users).where(eq(users.email, email))
        if (cekEmail.length > 0) return response.fail("email sudah di gunakan")

        let referredBy: number | null = null;
        if (referredCode) {
            const refUser = await db
                .select()
                .from(users)
                .where(eq(users.referralCode, referredCode))
                .limit(1);

            if (refUser.length === 0) {
                set.status = 400;
                return response.fail("Kode referral tidak valid");
            }

            referredBy = refUser[0].id;
        }
        const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        const hashed = await bcrypt.hash(password, 10)
        await db.insert(users).values({
            name,
            email,
            password: hashed,
            referralCode,
            referredBy
        })
        return response.success({
            name,
            email,
        }, "register berhasil")
    }

    static async resendOtp ({body, user, set}: any){
        const parsed = resendOtpSchema.safeParse(body);
        if (!parsed.success) {
            set.status = 422;
            return response.fail(parsed.error.issues.map((e)=>e.message).join(", "), 422);
        }

        const { type } = parsed.data;

        if (!user) {
            set.status = 401;
            return response.fail("User not authenticated");
        }

        // --- Expire old OTPs ---
        await db
            .update(otpCodes)
            .set({ status: "expired" })
            .where(
                and(
                    eq(otpCodes.userId, user.id),
                    eq(otpCodes.type, type),
                    eq(otpCodes.status, "pending")
                )
            );

        // --- Generate new OTP ---
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

        const result = await db.insert(otpCodes).values({
            userId: user.id,
            code: otpCode.toString(),
            type,
            status: "pending",
            expiresAt: sql`DATE_ADD(NOW(), INTERVAL 10 MINUTE)`, // ✅ hitung di MySQL
            createdAt: sql`NOW()`,
            updatedAt: sql`NOW()`,
        });

        const otpId = (result as any).insertId;

        // --- Kirim Email via Brevo ---
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.subject = "Your OTP Code";
            sendSmtpEmail.sender = { name: "vega.vaul", email: "admin@vaultsy.online" };
            sendSmtpEmail.to = [{ email: user.email, name: user.name }];
            sendSmtpEmail.htmlContent = `<p>Use this OTP to verify your account: <strong>${otpCode}</strong></p>`;

            await brevo.sendTransacEmail(sendSmtpEmail);
        } catch (e: any) {
            console.error("Failed to send OTP:", e.message);
            set.status = 500;
            return response.fail(`Failed to send OTP: ${e.message}`);
        }

        return response.success(
            {
                message: "OTP sent successfully",
                otp_id: otpId,
            },
            "OTP berhasil dikirim"
        );
    }

    static async verifyOtp({ body, user, set }: any) {
        const parsed = verifyOtpSchema.safeParse(body);
        if (!parsed.success) {
            set.status = 422;
            return response.fail(parsed.error.issues.map(e => e.message).join(", "), 422);
        }
        if (!user) {
            set.status = 401;
            return response.fail("Unauthorized");
        }
        const { code } = parsed.data;

        // 1) Expire semua OTP pending yang SUDAH lewat waktu (di DB, bukan JS)
        await db
            .update(otpCodes)
            .set({ status: "expired", updatedAt: sql`NOW()` })
            .where(
                and(
                    eq(otpCodes.userId, user.id),
                    eq(otpCodes.type, "email"),
                    eq(otpCodes.status, "pending"),
                    lte(otpCodes.expiresAt, sql`NOW()`)
                )
            );

        // 2) Ambil OTP yang masih valid: pending & belum lewat (expires_at > NOW())
        const [otp] = await db
            .select()
            .from(otpCodes)
            .where(
                and(
                    eq(otpCodes.userId, user.id),
                    eq(otpCodes.code, code),
                    eq(otpCodes.type, "email"),
                    eq(otpCodes.status, "pending"),
                    gt(otpCodes.expiresAt, sql`NOW()`)
                )
            )
            .orderBy(desc(otpCodes.createdAt))
            .limit(1);

        if (!otp) {
            set.status = 400;
            return response.fail("Invalid or expired OTP code");
        }

        // 3) Tandai used
        await db
            .update(otpCodes)
            .set({ status: "used", updatedAt: sql`NOW()` })
            .where(eq(otpCodes.id, otp.id));

        // 4) Verifikasi user
        await db
            .update(users)
            .set({ isVerified: true, updatedAt: sql`NOW()` })
            .where(eq(users.id, user.id));

        return response.success(
            {
                message: "OTP verified successfully",
                verified: true,
                user: { id: user.id, email: user.email, name: user.name },
            },
            "OTP berhasil diverifikasi"
        );
    }
}
