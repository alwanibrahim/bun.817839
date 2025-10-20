import { Elysia } from 'elysia';
import { db } from '../db';
import { users, deposits, affiliateCommissions } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

export const tripayWebhook = new Elysia().post('/api/tripay/webhook', async ({ body, set, headers }: any) => {
  try {
    
    const {
      reference,
      merchant_ref,
      status,
      amount,
      amount_received,
      signature,
    } = body;

    const secret = process.env.TRIPAY_PRIVATE_KEY!;

    
    const numericAmount = Number(amount_received ?? amount ?? 0);

    
    const normalizedStatus =
      ['success', 'PAID', 'paid'].includes(status)
        ? 'completed'
        : ['failed', 'CANCELED', 'EXPIRED'].includes(status)
          ? 'failed'
          : 'pending';

    
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

    
    const [trx] = await db
      .select()
      .from(deposits)
      .where(eq(deposits.reference, merchant_ref));

    if (!trx) {
      set.status = 404;
      return { success: false, message: 'Transaction not found' };
    }

    
    if (trx.status === 'completed') {
      return { success: true, message: 'Transaction already processed' };
    }

    
    await db.transaction(async (tx) => {
      
      await tx
        .update(deposits)
        .set({ status: normalizedStatus })
        .where(eq(deposits.reference, merchant_ref));

      
      if (normalizedStatus === 'completed') {
        
        await tx
          .update(users)
          .set({ balance: sql`${users.balance} + ${numericAmount}` })
          .where(eq(users.id, trx.userId));

        
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
          await tx.insert(affiliateCommissions).values({
            referrerId: user.referredBy,                  
            referredId: user.id,                          
            depositId: trx.id,                            
            commissionAmount: commission.toFixed(2),      
           
          });


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
