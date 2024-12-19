import { GraphComponent, IGraph, ItemEventArgs, IBend, BendEventArgs } from 'yfiles'

class someClass{
  handler = function (_sender: IGraph, evt: BendEventArgs | ItemEventArgs<IBend>){
    console.log(evt)
  }

  addHandler(){
    const gc = new GraphComponent()
    gc.graph.addBendAddedListener(this.handler)
    gc.graph.addBendRemovedListener(this.handler)
    gc.graph.removeBendAddedListener(this.handler)
  }
}
