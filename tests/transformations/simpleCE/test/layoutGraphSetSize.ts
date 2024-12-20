import { LayoutGraph, YDimension } from 'yfiles'

function a(graph: LayoutGraph) {
  graph.nodes.forEach((n, idx) => {
    const nodeSize = 5

    graph.setSize(n, nodeSize, 40)

    const size = new YDimension(nodeSize,40)

    graph.setSize(n, size)
  })
}
