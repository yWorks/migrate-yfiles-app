import { Point } from '@yfiles/yfiles'

const p = new Point(0,1)
/*TODO-Migration Signature changes have been applied to p.distanceTo(new Point(2,3),new Point(4,5))*/p.distanceToSegment(new Point(4,5),new Point(2,3))
