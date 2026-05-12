import { CanvasComponent, GraphComponent } from '@yfiles/yfiles'

const canvas = new CanvasComponent()
const loc1 = canvas.lastPointerEvent.location

const graphComponent = new GraphComponent()
const loc2 = graphComponent.lastPointerEvent.location
