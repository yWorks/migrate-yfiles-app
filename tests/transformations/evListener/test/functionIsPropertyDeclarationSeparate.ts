import { GraphComponent,IGraph, ItemEventArgs, IBend  } from 'yfiles'

class someClass{
  constructor() {
    this.handler = (sender: IGraph, evt:ItemEventArgs<IBend>)=>{
      console.log(sender,evt)
    }
  }
  handler : (sender: IGraph, evt: ItemEventArgs<IBend>) => void


  addHandler(){
    const gc = new GraphComponent()
    gc.graph.addBendAddedListener(this.handler)
  }
}
