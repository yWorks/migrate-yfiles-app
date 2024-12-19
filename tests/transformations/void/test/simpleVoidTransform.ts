import {VoidNodeStyle, GraphComponent, GraphSelectionIndicatorManager } from 'yfiles'

const gc = new GraphComponent()
const vs = VoidNodeStyle.INSTANCE
gc.selectionIndicatorManager = new GraphSelectionIndicatorManager({
  nodeStyle: VoidNodeStyle.INSTANCE
})
