import { HierarchicLayoutData, INode, IEdge } from 'yfiles'

const hierarchicLayoutData = new HierarchicLayoutData()
let incrementalItems: (INode|IEdge)[] = []
hierarchicLayoutData.incrementalHints.incrementalLayeringNodes = incrementalItems.filter(item => item instanceof INode)
hierarchicLayoutData.incrementalHints.incrementalSequencingItems = incrementalItems.filter(item => item instanceof IEdge)
