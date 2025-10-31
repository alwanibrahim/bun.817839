import { db } from '../db'
import { nodes } from '../db/schema'
import { response } from '../utils/response'
import {z} from 'zod'
import {CreateSchema} from '../../../../packages/shared/schema/nodes'
export class NodesControllers {
   static async index() {
      const data = await db.select().from(nodes)
      return response.success(data)
   }
   static async create({ body, user }: any) {
     const parse = CreateSchema.safeParse(body)
        if(!parse.success) return response.fail(parse.error?.issues.map((e)=> e.message).join(", "), 422)
         const {flowId, type, data, nextNodeId, positionX, positionY} = parse.data

      const result = await db.insert(nodes).values({
         flowId: flowId,
         type: type,
         data: data,
         nextNodeId: nextNodeId,
         positionX: positionX,
         positionY: positionY

      })

      return response.success({
         data: {
            flowId: flowId,
            type: type,
            data: data,
            nextNodeId: nextNodeId,
            positionX: positionX,
            positionY: positionY
         }

      })
   }
}