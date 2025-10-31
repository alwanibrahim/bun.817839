import { response } from "../utils/response"
import { z } from 'zod'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

export const GameSchema = z.object({
    kode: z.string(),
    idGame: z.coerce.number().min(5).optional(),
    playerId: z.coerce.number().min(5).optional(),
    userId: z.coerce.number().min(5).optional(),
    server: z.enum(["asia", "europa", "america", "tw_hk_mo"]).optional(),
    idRiot: z.string().optional()

})


//kode:
//supersus: idGame, 
//Ml : userId, serverId, 
//FF : playerId, 
//GIR: userId, pilihan server : Asia, europa, americe, TW_HK_MO
//VALO: idRiot, + #1234

export class GameTopupController {
    static async topup({ body, user }: any) {
        const parse = GameSchema.safeParse(body)
        if (!parse.success) return response.fail(parse.error.issues.map((e) => e.message).join(", "), 422)
        const BASE_URL = 'https://api.tokovoucher.net/produk/code?'
        const member_code = process.env.MEMBER_CODE_GAME
        const signature = process.env.SIGNATURE_DEFAULT_GAME
        const kode = parse.data.kode

        const res = await fetch(`${BASE_URL}member_code=${member_code}&signature=${signature}&kode=${kode}`)
        const data = await res.json()
        if (!res.ok) {
            return response.fail(data, res.status)
        }
        const santai = await db.select().from(users).where(eq(users.id, user.id))
        const dataSantai = santai[0]
        if( dataSantai.balance < data.data[0].price ){
            return response.success("saldo tidak cukup")
        }
        //member_code
        //signature
        //kode

    
        switch (parse.data?.kode.toUpperCase()) {
            case "SUS":


                return response.success(data)
                break;
            case "ML":

                return response.success(data.data[0].price, "dari ml")
                break;
            case "CEK":

                return response.success(santai, "dari user")
                break;
            default:
                break;
        }


    }

}
