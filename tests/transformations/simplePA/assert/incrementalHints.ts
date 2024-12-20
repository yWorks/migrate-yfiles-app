import { HierarchicLayoutData, INode, IEdge } from 'yfiles'

const hierarchicLayoutData = new HierarchicLayoutData()
let incrementalItems: (INode|IEdge)[] = []
hierarchicLayoutData.incrementalNodes = incrementalItems.filter(item => item instanceof INode)
hierarchicLayoutData.incrementalEdges = incrementalItems.filter(item => item instanceof IEdge)
