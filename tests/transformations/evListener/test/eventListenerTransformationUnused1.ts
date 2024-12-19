import { GraphComponent } from 'yfiles'

const gc = new GraphComponent()
gc.graph.addBendAddedListener((_)=>{console.log("a")})
