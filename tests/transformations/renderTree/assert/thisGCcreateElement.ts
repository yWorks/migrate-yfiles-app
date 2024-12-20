import { HtmlVisual, GraphComponent, ICanvasObjectDescriptor } from 'yfiles'

const foo = {gc : new GraphComponent()}

let visual: HtmlVisual
const custom = "C"

function foo2(){
  foo.gc.renderTree.backgroundGroup.renderTree.createElement(foo.gc.renderTree.backgroundGroup, visual)
  foo.gc.renderTree.backgroundGroup./*TODO-Migration Replace addChild with renderTree.createElement, you need to take care of the renderer*/addChild(custom, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
}
