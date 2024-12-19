import { HtmlVisual, GraphComponent, ICanvasObjectDescriptor } from 'yfiles'

const foo = {gc : new GraphComponent()}

let visual: HtmlVisual
const custom = "C"

function foo2(){
  foo.gc.backgroundGroup.addChild(visual, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
  foo.gc.backgroundGroup.addChild(custom, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
}
