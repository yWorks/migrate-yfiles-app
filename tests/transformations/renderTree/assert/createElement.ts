import { HtmlVisual, GraphComponent, ICanvasObjectDescriptor } from 'yfiles'

const gc = new GraphComponent()
let visual: HtmlVisual
const custom = "C"

function foo(){
  gc.renderTree.backgroundGroup.renderTree.createElement(gc.renderTree.backgroundGroup, visual)
  gc.renderTree.backgroundGroup./*TODO-Migration Replace addChild with renderTree.createElement, you need to take care of the renderer*/addChild(custom, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
}
