import { GraphComponent } from 'yfiles'

const gc = new GraphComponent()
gc.graph.addBendAddedListener((sender, evt)=>{console.log("a")})
