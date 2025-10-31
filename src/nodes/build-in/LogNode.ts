import { BaseNode } from '../core/BaseNode'
type LogParams = {
    message: string;

}

export class LogNode extends BaseNode<LogParams> {
    name = "Log message";
    description = "ini adalah node testing";
    parameters = [
        { keys: "message", type: "string", required: true }
    ];
    async execute(ctx: { params: LogParams }): Promise<any> {
        console.log("[LOG NODE]", ctx.params.message);
        return ctx
    }
}