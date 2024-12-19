import { GraphComponent } from 'yfiles'

const gc = new GraphComponent()
gc.graph.addEventListener('bend-added', (evt, sender)=>{console.log(sender, evt)})
