import type { LayoutGraph, Point } from 'yfiles'

function placeNodes(graph: LayoutGraph): void {
  let maxW = graph.nodes.first().layout.width
  for (const node of graph.nodes) {
    maxW = Math.max(maxW, node.layout.width)
    node.layout.center = new Point(3, 0)
  }
  for (const edge of graph.edges){
    const cxSrc = edge.source.layout.centerX
  }
}
