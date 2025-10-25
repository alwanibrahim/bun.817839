import { response } from "../utils/response"


export class GameTopupController {
    static async topup({ body }: any) {
        const {idGame} = body
        return response.success(body)
    }

}
