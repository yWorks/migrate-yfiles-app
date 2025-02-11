import { LayoutGraph, LayoutGrid } from '@yfiles/yfiles'

function applyLayout(graph: LayoutGraph): void {
  if (graph.isEmpty
  ) {
    return
  }

  const grid = LayoutGrid.getLayoutGrid(graph)
}
