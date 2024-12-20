import { GraphComponent,IGraph, ItemEventArgs, IBend  } from 'yfiles'

class someClass{
  handler = function (sender: IGraph, evt:ItemEventArgs<IBend>){
    console.log(sender,evt)
  }

  addHandler(){
    const gc = new GraphComponent()
    gc.graph.addBendAddedListener(this.handler)
  }
}
