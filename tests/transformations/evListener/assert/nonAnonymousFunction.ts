import { GraphComponent,IGraph, ItemEventArgs, IBend  } from 'yfiles'


function handler(evt: ItemEventArgs<IBend>, sender: IGraph){
  console.log(sender,evt)
}

const gc = new GraphComponent()
gc.graph.addEventListener('bend-added', handler)
