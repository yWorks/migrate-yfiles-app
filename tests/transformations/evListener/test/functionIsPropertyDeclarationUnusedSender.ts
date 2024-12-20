import { GraphComponent,IGraph, ItemEventArgs, IBend  } from 'yfiles'

class someClass{
  handler = function (_sender: IGraph, evt:ItemEventArgs<IBend>){
    console.log(evt)
  }

  addHandler(){
    const gc = new GraphComponent()
    gc.graph.addBendAddedListener(this.handler)
  }
}
