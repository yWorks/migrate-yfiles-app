import { GraphComponent,IGraph, ItemEventArgs, IBend  } from 'yfiles'

const handler =  (evt: ItemEventArgs<IBend>, sender: IGraph)=> {
  console.log(sender,evt)
}

function addHandler(){
  const gc = new GraphComponent()
  gc.graph.addEventListener('bend-added', handler)
}