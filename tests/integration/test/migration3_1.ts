import { ToolTipInputMode, DiscreteEdgeLabelPositions, CanvasComponent } from '@yfiles/yfiles'

const mode = new ToolTipInputMode()
mode.show([0,0])
mode.hide()

const position = DiscreteEdgeLabelPositions.CENTERED

const canvas = new CanvasComponent()
const event = canvas.lastInputEvent
