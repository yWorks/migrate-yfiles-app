import type { LayoutGraph, Graph } from 'yfiles'

function applyLayout(graph: LayoutGraph): void {
  if (graph.nodes.size > 0) {
    console.log("Nodes")
  }

  if (graph.edges.size > 0) {
    console.log("Edges")
  }

  if (graph.nodes.size > 0) {
    console.log("Nodes")
  }

  if (graph.edges.size > 0) {
    console.log("Edges")
  }
}

function applyLayout2(graph: Graph): void {
  if (graph.nodes.size > 0) {
    console.log("Nodes")
  }

  if (graph.edges.size > 0) {
    console.log("Edges")
  }

  if (graph.nodes.size > 0) {
    console.log("Nodes")
  }

  if (graph.edges.size > 0) {
    console.log("Edges")
  }
}
