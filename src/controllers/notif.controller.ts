import { db } from "../db";
import { notifications, users } from "../db/schema";
import { response } from "../utils/response";
import { eq, sql, and } from 'drizzle-orm'
import { z } from 'zod'

const createNotificationSchema = z.object({
    userId: z.number().int(),
    title: z.string('masukkan title').min(3, 'masukkan minimal 3 karakter'),
    message: z.string("masukkan message"),
    type: z.enum(["system", "admin"])
});

export class NotifController {

    static updateNotificationSchema = createNotificationSchema.partial();
    static async index() {
        const data = await db.select().from(notifications)
        return response.success(data, "data berhasil")
    }
    static async store({ body, user, set }: any) {

        const parsed = createNotificationSchema.safeParse(body);
        if (!parsed.success) {
            set.status = 422;
            return response.fail(parsed.error.issues.map((e)=> e.message).join(", "), 422);
        }

        const { userId, title, message, type } = parsed.data;

        // pastikan user_id valid
        const [userExists] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!userExists) {
            set.status = 404;
            return response.fail("User tidak ditemukan");
        }

        // insert ke tabel notifications
        const result = await db.insert(notifications).values({
            userId: user.id,
            title,
            message,
            type,
            isRead: 0,

        });

        const notificationId = (result as any).insertId;

        return response.success(
            {
                message: "Notification created successfully",
                notification: {
                    id: notificationId,
                    userId,
                    title,
                    message,
                    type,
                    is_read: false,
                },
            },
            "Notifikasi berhasil dibuat"
        );

    }

    static async markAsRead({params, set}: any){
        const notificationId = Number(params.id);

        if (isNaN(notificationId)) {
            set.status = 400;
            return response.fail("Invalid notification ID");
        }

        const [notif] = await db
            .select()
            .from(notifications)
            .where(eq(notifications.id, notificationId))
            .limit(1);

        if (!notif) {
            set.status = 404;
            return response.fail("Notification not found");
        }

        await db
            .update(notifications)
            .set({ isRead: 1})
            .where(eq(notifications.id, notificationId));

        return response.success(
            { message: "Notification marked as read", notification_id: notificationId },
            "Notifikasi berhasil ditandai dibaca"
        );
    }

    static async markAllRead({user}: any){
        await db
            .update(notifications)
            .set({ isRead: 1 })
            .where(eq(notifications.userId, user.id));

        return response.success(
            { message: "All notifications marked as read" },
            "Semua notifikasi ditandai sudah dibaca"
        );
    }
    static async unReadCount({user}: any){
        const [count] = await db
            .select({ unread_count: sql<number>`COUNT(*)` })
            .from(notifications)
            .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, 0)));

        return response.success(count, "Jumlah notifikasi belum dibaca");
    }
    static async update({ params, body, set }: any) {

    }
    static async destroy({ params }: any) {
        const id = Number(params.id)
        await db.delete(notifications).where(eq(notifications.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
