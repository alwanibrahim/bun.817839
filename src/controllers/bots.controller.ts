import {db} from '../db'
import {bots} from '../db/schema'
import { response } from '../utils/response'
import {randomBytes} from 'crypto'
import {CreateSchema} from '../../../../packages/shared/schema/bots'

function generateToken(length = 16) {
    return randomBytes(length).toString("hex")
}
export class BotsControllers {
   static async index(){
    const data = await db.select().from(bots)
    return response.success(data)
   }

   static async create({body, user}: any){
   const parse = CreateSchema.safeParse(body)
   if(!parse.success) return response.fail(parse.error?.issues.map((e)=> e.message).join(", "), 422)
    const {name, isActive, userName, webhookUrl} = parse.data
    const token =  generateToken()
    const data = await db.insert(bots).values({
        name: name, 
        userId: user.id, 
        userName: userName, 
        token: token, 
        isActive: isActive ?? false, 
        webhookUrl: webhookUrl
    })
    return response.success({data: {
         name: name, 
        userId: user.id, 
        userName: userName, 
        token: token, 
        isActive: isActive ?? false, 
        webhookUrl: webhookUrl 
    }}, "data berhasil di add ")
   }
   
}