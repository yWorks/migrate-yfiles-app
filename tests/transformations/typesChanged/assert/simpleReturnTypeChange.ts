
import { GraphComponent, Point } from 'yfiles'

const gc = new GraphComponent()
const co = gc./*TODO-Migration Possible breaking change: Return Type from method getCanvasObject has changed to NewType*/getCanvasObject(new Point(0, 0))
