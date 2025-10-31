import {db} from '../db'
import {flows} from '../db/schema'
import { response } from '../utils/response'
export class FlowsControllers {
   static async index(){
    const data = await db.select().from(flows)
    return response.success(data)
   }

   static async create({body, user}: any){
      const {botId, name, trigger, isActive} = body
     const data = await db.insert(flows).values({
         botId: botId, 
         name: name, 
         trigger: trigger, 
         isActive: isActive ?? false, 

      })

      return response.success({data: {
          botId: botId, 
         name: name, 
         trigger: trigger, 
         isActive: isActive ?? false, 
      }})
   }
}