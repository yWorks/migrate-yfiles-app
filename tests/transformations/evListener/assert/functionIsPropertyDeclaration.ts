import { GraphComponent,IGraph, ItemEventArgs, IBend  } from 'yfiles'

class someClass{
  handler =  (evt: ItemEventArgs<IBend>, sender: IGraph){
    console.log(sender,evt)
  }

  addHandler(){
    const gc = new GraphComponent()
    gc.graph.addEventListener('bend-added', this.handler)
  }
}
