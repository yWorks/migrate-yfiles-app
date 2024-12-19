import { GraphComponent } from 'yfiles'

const gc = new GraphComponent()
gc.graph.addBendAddedListener((sender)=>{console.log(sender)})
