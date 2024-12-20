import { GraphComponent } from 'yfiles'

const graphComponent = new GraphComponent()
graphComponent.addEventListener('pointer-click', (evt, sender) =>{
  console.log(sender, evt)
})
graphComponent.removeEventListener('pointer-click', (evt, sender) =>{
  console.log(sender, evt)
})
