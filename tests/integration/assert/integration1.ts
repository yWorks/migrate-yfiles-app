import { LayoutGraph, LayoutGrid, Command } from '@yfiles/yfiles'

function applyLayout(graph: LayoutGraph): void {
  if (graph.isEmpty
  ) {
    return
  }

  const grid = LayoutGrid.getLayoutGrid(graph)
}

const command = Command.ADD_LABEL