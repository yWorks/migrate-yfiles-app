import {GraphComponent, IGraph, ItemEventArgs, INode, HierarchicalLayout, GraphEditorInputMode, GraphItemTypes, LayoutExecutor, Point, INodeStyle } from '@yfiles/yfiles'

const graphComponent = new GraphComponent()

function myEventCallback(evt: ItemEventArgs<INode>){
  graphComponent.graph.setStyle(evt.item, INodeStyle.VOID_NODE_STYLE)
}

graphComponent.graph.addEventListener('node-created', myEventCallback)

const geim =  new GraphEditorInputMode({
  /*TODO-Migration movableItems has been removed. use movableSelected/UnselectedItems respectively*/movableItems:GraphItemTypes.NONE
})

const layout = new HierarchicalLayout(/*TODO-Migration Orthogonal Routing is the new default, if a different edge routing is desired it needs to be set on the routingStyleDescriptor.DefaultRoutingStyle*/{
  automaticEdgeGrouping: true
})
layout.fromSketchMode = true


LayoutExecutor.ensure()

graphComponent.applyLayoutAnimated(layout)

/*TODO-Migration Signature changes have been applied to graphComponent.zoomToAnimated(new Point(42,42), 2)*/graphComponent.zoomToAnimated(2, new Point(42,42))