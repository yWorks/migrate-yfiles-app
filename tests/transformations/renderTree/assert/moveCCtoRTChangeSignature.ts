import { GraphComponent, Point } from 'yfiles'

const gc = new GraphComponent()
const group = gc.renderTree.hitElementsAt(new Point(0,1), null)
