import { LayoutGraph, PartitionGrid, ICommand } from 'yfiles'

function applyLayout(graph: LayoutGraph): void {
  if (graph.empty
  ) {
    return
  }

  const grid = PartitionGrid.getPartitionGrid(graph)
}

const command = ICommand.ADD_LABEL