import { GraphComponent, Point } from 'yfiles'

const gc = new GraphComponent()
/*TODO-Migration Signature changes have been applied to gc.zoomTo(new Point(0, 0), 1.0), verify if the applied changes are desired*/gc.zoomTo(1.0, new Point(0, 0))
