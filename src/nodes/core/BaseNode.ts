export abstract class BaseNode<Tparams = any> {
    abstract name: string;
    abstract description: string;
    abstract parameters: any[];
    abstract execute(ctx: any): Promise<any>
}