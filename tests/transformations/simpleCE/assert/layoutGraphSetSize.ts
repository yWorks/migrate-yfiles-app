import { LayoutGraph, YDimension } from 'yfiles'

function a(graph: LayoutGraph) {
  graph.nodes.forEach((n, idx) => {
    const nodeSize = 5

    n.layout.width = nodeSize
      n.layout.height = 40

    const size = new YDimension(nodeSize,40)

    n.layout.width = size.width
      n.layout.height = size.height
  })
}
