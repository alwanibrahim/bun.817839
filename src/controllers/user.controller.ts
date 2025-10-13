import { db } from "../db";
import { users } from "../db/schema";
import { response } from "../utils/response";
import { eq } from 'drizzle-orm'

export class UserController {
    static async index() {
        const data = await db.select().from(users)
        return response.success(data, "data berhasil")
    }

    static async me({user}: any) {
        const data = await db.select().from(users).where(eq(users.id, user.id)).limit(2)
        if(!data) return response.fail("data tidak di temukan")
            return response.success(data, "data berhasil")

    }

    static async store({ body, user, set }: any) {

    }
    static async update({ params, body, set }: any) {

    }
    static async destroy({ params }: any) {
        const id = Number(params.id)
        await db.delete(users).where(eq(users.id, id))
        return response.success(`data dengan ID : ${id} berhasil di hapus`)
    }
}
