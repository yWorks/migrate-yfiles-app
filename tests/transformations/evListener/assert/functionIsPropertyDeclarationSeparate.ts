import { GraphComponent,IGraph, ItemEventArgs, IBend  } from 'yfiles'

class someClass{
  constructor() {
    this.handler = (evt: ItemEventArgs<IBend>, sender: IGraph)=>{
      console.log(sender,evt)
    }
  }
  handler : (evt: ItemEventArgs<IBend>, sender: IGraph) => void


  addHandler(){
    const gc = new GraphComponent()
    gc.graph.addEventListener('bend-added', this.handler)
  }
}
