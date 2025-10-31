import { BaseNode } from '../core/BaseNode'
export type ConditionalParams = {
    right: number;
    left: number;
    operator: ">" | "<" | "=="  | ">=" | "<=" | "!="
}

export class ConditionalNode extends BaseNode<ConditionalParams> {
    name = "Conditinal bro";
    description = "ini adalah conditional";
    parameters = [
        { key: "right", type: "number", required: true },
        { key: "operator", type: "string", required: true },
        { key: "left", type: "number", required: true },
    ];

    async execute(ctx: { params: ConditionalParams }) {
        const { left, operator, right } = ctx.params
        let result = false
        switch (operator) {
            case "!=":
                result = left != right
                break;
            case "<":
                result = left < right
                break;
            case "==":
                result = left == right
                break;
            case ">":
                result = left > right
                break;
            case "<=":
                result = left <= right
                break;
            case ">=":
                result = left >= right
                break;

            default:
                throw new Error("Operator tidak valid geng");

        }
        return {
            ...ctx, 
            result
        }
    }


}