import { GraphComponent,IGraph, ItemEventArgs, IBend  } from 'yfiles'

const handler =  ( sender: IGraph,evt: ItemEventArgs<IBend>)=> {
  console.log(sender,evt)
}

function addHandler(){
  const gc = new GraphComponent()
  gc.graph.addBendAddedListener(handler)
}