import { GraphComponent } from 'yfiles'

const gc = new GraphComponent()
gc.graph.addEventListener('bend-added', ()=>{console.log("a")})
