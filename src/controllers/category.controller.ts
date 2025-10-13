import { db } from "../db";
import { categories } from "../db/schema";
import { response } from "../utils/response";

export class CategoriyController {
    static async index(){
        const data = await db.select().from(categories)
        return response.success(data, "data berhasil")
    }
    static async store(){
    }
    static async update(){
    }
    static async destroy(){
    }
}
