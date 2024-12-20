import type { LayoutGraph, Graph } from 'yfiles'

function applyLayout(graph: LayoutGraph): void {
  if (graph.nodeCount > 0) {
    console.log("Nodes")
  }

  if (graph.edgeCount > 0) {
    console.log("Edges")
  }

  if (graph.n > 0) {
    console.log("Nodes")
  }

  if (graph.e > 0) {
    console.log("Edges")
  }
}

function applyLayout2(graph: Graph): void {
  if (graph.nodeCount > 0) {
    console.log("Nodes")
  }

  if (graph.edgeCount > 0) {
    console.log("Edges")
  }

  if (graph.n > 0) {
    console.log("Nodes")
  }

  if (graph.e > 0) {
    console.log("Edges")
  }
}
