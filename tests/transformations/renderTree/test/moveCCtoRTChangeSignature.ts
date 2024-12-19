import { GraphComponent, Point } from 'yfiles'

const gc = new GraphComponent()
const group = gc.hitElementsAt(new Point(0,1))
