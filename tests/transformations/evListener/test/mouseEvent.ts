import { GraphComponent } from 'yfiles'

const graphComponent = new GraphComponent()
graphComponent.addMouseClickListener((sender, evt) =>{
  console.log(sender, evt)
})
graphComponent.removeMouseClickListener((sender, evt) =>{
  console.log(sender, evt)
})
