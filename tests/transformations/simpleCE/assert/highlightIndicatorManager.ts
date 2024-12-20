import { GraphComponent, GraphHighlightIndicatorManager } from 'yfiles'

const graphComponent = new GraphComponent();
const manager = graphComponent.highlightIndicatorManager

graphComponent.highlightIndicatorManager.items?.clear()

// first remove previous highlights
manager.items?.clear()
graphComponent.graph.nodes.forEach((node) => { manager.items?.add(node) })

const ghlm = new GraphHighlightIndicatorManager()

ghlm.items?.clear()
graphComponent.graph.nodes.forEach((node) => { ghlm.items?.add(node) })
