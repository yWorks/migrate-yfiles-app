import { GraphComponent,IGraph, ItemEventArgs, IBend  } from 'yfiles'


function handler(sender: IGraph, evt:ItemEventArgs<IBend>){
  console.log(sender,evt)
}

const gc = new GraphComponent()
gc.graph.addBendAddedListener(handler)
