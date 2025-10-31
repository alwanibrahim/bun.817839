export async function  runWorkFlow(nodes:any[], initialContext: any = {}) {
    let context = initialContext;
    for (const node of nodes){
        context = await node.execute(context);
    }
    return context
    
}