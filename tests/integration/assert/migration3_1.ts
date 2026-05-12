import { ToolTipInputMode, DiscreteEdgeLabelPositions, CanvasComponent } from '@yfiles/yfiles'

const mode = new ToolTipInputMode()
mode.open([0,0])
mode.close()

const position = DiscreteEdgeLabelPositions.CENTER

const canvas = new CanvasComponent()
const event = canvas.lastPointerEvent
