import {LogNode} from '../nodes/build-in/LogNode'
import {SantaiLagi} from '../nodes/build-in/MathAddNode'
import {ConditionalNode} from '../nodes/build-in/ConditionalNode'
import {runWorkFlow} from '../engine/WorkFlowRunner'

export const  testNodeFlow = async()=>{
    const result = await runWorkFlow([
    new LogNode(),
    new SantaiLagi(),
    new ConditionalNode()
  ], {
    params: {
      message: "Node pertama jalan",
      a: 10,
      b: 20,
      left: 30, 
      operator: ">", 
      right: 15

    },
  });

  return result; // 30
}