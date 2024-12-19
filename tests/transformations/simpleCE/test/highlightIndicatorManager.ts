import { GraphComponent, GraphHighlightIndicatorManager } from 'yfiles'

const graphComponent = new GraphComponent();
const manager = graphComponent.highlightIndicatorManager

graphComponent.highlightIndicatorManager.clearHighlights()

// first remove previous highlights
manager.clearHighlights()
graphComponent.graph.nodes.forEach((node) => { manager.addHighlight(node) })

const ghlm = new GraphHighlightIndicatorManager()

ghlm.clearHighlights()
graphComponent.graph.nodes.forEach((node) => { ghlm.addHighlight(node) })
