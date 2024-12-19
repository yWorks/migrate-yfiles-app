import { GraphComponent,IGraph, ItemEventArgs, IBend  } from 'yfiles'

class someClass{
  handler = function (evt: ItemEventArgs<IBend>){
    console.log(evt)
  }

  addHandler(){
    const gc = new GraphComponent()
    gc.graph.addEventListener('bend-added', this.handler)
  }
}
