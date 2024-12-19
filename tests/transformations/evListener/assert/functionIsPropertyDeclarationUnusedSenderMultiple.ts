import { GraphComponent, IGraph, ItemEventArgs, IBend, BendEventArgs } from 'yfiles'

class someClass{
  handler = function (evt: BendEventArgs | ItemEventArgs<IBend>){
    console.log(evt)
  }

  addHandler(){
    const gc = new GraphComponent()
    gc.graph.addEventListener('bend-added', this.handler)
    gc.graph.addEventListener('bend-removed', this.handler)
    gc.graph.removeEventListener('bend-added', this.handler)
  }
}
