import { LayoutGraph, PartitionGrid } from 'yfiles'

function applyLayout(graph: LayoutGraph): void {
  if (graph.empty
  ) {
    return
  }

  const grid = PartitionGrid.getPartitionGrid(graph)
}
