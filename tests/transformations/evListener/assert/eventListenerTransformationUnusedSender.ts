import { GraphComponent } from 'yfiles'

const gc = new GraphComponent()
gc.graph.addEventListener('bend-added', (evt)=>{console.log(evt)})
