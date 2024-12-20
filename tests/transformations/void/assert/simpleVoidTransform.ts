import {VoidNodeStyle, GraphComponent, GraphSelectionIndicatorManager, INodeStyle } from 'yfiles'

const gc = new GraphComponent()
const vs = INodeStyle.VOID_NODE_STYLE
gc.selectionIndicatorManager = new GraphSelectionIndicatorManager({
  nodeStyle: INodeStyle.VOID_NODE_STYLE
})
