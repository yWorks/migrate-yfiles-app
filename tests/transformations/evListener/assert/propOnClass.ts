import {GraphComponent} from 'yfiles'

class MyClass{
  constructor(
    protected graphComponent: GraphComponent ) {
  }
  doSmth(){
    this.graphComponent.addEventListener('background-group-changed', (args)=>{
      console.log(args)
    })
  }
}

const myClass = new MyClass(new GraphComponent())
myClass.doSmth()
