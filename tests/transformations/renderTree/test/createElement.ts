import { HtmlVisual, GraphComponent, ICanvasObjectDescriptor } from 'yfiles'

const gc = new GraphComponent()
let visual: HtmlVisual
const custom = "C"

function foo(){
  gc.backgroundGroup.addChild(visual, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
  gc.backgroundGroup.addChild(custom, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
}
