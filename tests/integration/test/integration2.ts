import {GraphComponent, IGraph, ItemEventArgs, INode, VoidNodeStyle, HierarchicLayout, GraphEditorInputMode, GraphItemTypes, LayoutExecutor, Class, Point, LayoutMode} from 'yfiles'

const graphComponent = new GraphComponent()

function myEventCallback(sender: IGraph, evt: ItemEventArgs<INode>){
  graphComponent.graph.setStyle(evt.item, VoidNodeStyle.INSTANCE)
}

graphComponent.graph.addNodeCreatedListener(myEventCallback)

const geim =  new GraphEditorInputMode({
  movableItems:GraphItemTypes.NONE
})

const layout = new HierarchicLayout({
  automaticEdgeGrouping: true
})
layout.layoutMode = LayoutMode.INCREMENTAL


Class.ensure(LayoutExecutor)

graphComponent.morphLayout(layout)

graphComponent.zoomToAnimated(new Point(42,42), 2)