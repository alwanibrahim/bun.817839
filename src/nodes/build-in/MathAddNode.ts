import {BaseNode} from '../core/BaseNode'
type Santai = {
    a: number;
    b: number
}


export class SantaiLagi extends BaseNode<Santai>{
    name = "Ini adalah matematika";
    description= "ini sangat menyenangkan";
    parameters= [
        {keys: "a", type: "number", required: true}, 
        {keys: "b", type: "number", required: true}
    ];
   async execute(ctx: {params: Santai}): Promise<any> {
        const result =  ctx.params.a + ctx.params.b
       return {
        ...ctx, 
        result
       }
    }
}