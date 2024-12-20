import { GraphBuilder } from 'yfiles'

const gb = new GraphBuilder()

gb.addEventListener('node-created', ({ graph, item, dataItem }) => {
  console.log(graph, dataItem)
})
