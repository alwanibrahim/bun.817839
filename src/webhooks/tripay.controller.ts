import { Elysia } from 'elysia';
import { db } from '../db';
import { users, deposits } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

export const tripayWebhook = new Elysia().post('/api/tripay/webhook', async ({ body, set, headers }: any) => {
  try {
    // ✅ Extract data dari callback Tripay
    const {
      reference,
      merchant_ref,
      status,
      amount,
      amount_received,
      signature,
    } = body;

    const secret = process.env.TRIPAY_PRIVATE_KEY!;

    // 💰 Ambil nominal (Tripay bisa kirim amount atau amount_received)
    const numericAmount = Number(amount_received ?? amount ?? 0);

    // 🧠 Map status Tripay → internal
    const normalizedStatus =
      ['success', 'PAID', 'paid'].includes(status)
        ? 'completed'
        : ['failed', 'CANCELED', 'EXPIRED'].includes(status)
        ? 'failed'
        : 'pending';

    // 🔒 Verifikasi signature (optional tapi disarankan)
    const expectedSign = crypto
      .createHmac('sha256', secret)
      .update(reference + (amount ?? amount_received ?? '0'))
      .digest('hex');

    if (signature && signature !== expectedSign) {
      set.status = 403;
      return { success: false, message: 'Invalid signature' };
    }

    console.log('✅ Tripay Webhook received:', {
      reference,
      merchant_ref,
      status,
      amount_received,
      normalizedStatus,
    });

    // 🔎 Cari transaksi berdasarkan merchant_ref
    const [trx] = await db
      .select()
      .from(deposits)
      .where(eq(deposits.reference, merchant_ref));

    if (!trx) {
      set.status = 404;
      return { success: false, message: 'Transaction not found' };
    }

    // 🧱 Anti double callback
    if (trx.status === 'completed') {
      return { success: true, message: 'Transaction already processed' };
    }

    // ⚙️ Jalankan semua query dalam 1 transaksi
    await db.transaction(async (tx) => {
      // Update status deposit
      await tx
        .update(deposits)
        .set({ status: normalizedStatus })
        .where(eq(deposits.reference, merchant_ref));

      // Kalau pembayaran sukses → tambahkan saldo
      if (normalizedStatus === 'completed') {
        // 💰 Tambah saldo user
        await tx
          .update(users)
          .set({ balance: sql`${users.balance} + ${numericAmount}` })
          .where(eq(users.id, trx.userId));

        // 🤝 Cek referral
        const [user] = await tx
          .select()
          .from(users)
          .where(eq(users.id, trx.userId));

        if (user && user.referredBy) {
          const commission = numericAmount * 0.1;

          await tx
            .update(users)
            .set({ balance: sql`${users.balance} + ${commission}` })
            .where(eq(users.id, user.referredBy));

          console.log(`💸 Referral commission ${commission} added to user ${user.referredBy}`);
        }
      }
    });

    console.log(`✅ Transaction ${merchant_ref} updated → ${normalizedStatus}`);

    return { success: true, message: `Transaction updated: ${normalizedStatus}` };
  } catch (err: any) {
    console.error('❌ Tripay Webhook Error:', err);
    set.status = 500;
    return { success: false, message: err.message || 'Internal server error' };
  }
});
