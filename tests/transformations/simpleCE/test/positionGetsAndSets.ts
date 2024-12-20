import type { LayoutGraph, Point } from 'yfiles'

function placeNodes(graph: LayoutGraph): void {
  let maxW = graph.getWidth(graph.nodes.first())
  for (const node of graph.nodes) {
    maxW = Math.max(maxW, graph.getWidth(node))
    graph.setCenter(node, new Point(3, 0))
  }
  for (const edge of graph.edges){
    const cxSrc = graph.getCenterX(edge.source)
  }
}
