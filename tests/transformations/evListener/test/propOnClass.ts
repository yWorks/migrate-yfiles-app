import {GraphComponent} from 'yfiles'

class MyClass{
  constructor(
    protected graphComponent: GraphComponent ) {
  }
  doSmth(){
    this.graphComponent.addBackgroundGroupChangedListener((sender, args)=>{
      console.log(args)
    })
  }
}

const myClass = new MyClass(new GraphComponent())
myClass.doSmth()
