import { GraphBuilder } from 'yfiles'

const gb = new GraphBuilder()

gb.addNodeCreatedListener((_, { graph, item, dataItem }) => {
  console.log(graph, dataItem)
})
