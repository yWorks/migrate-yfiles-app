import { GraphComponent, Point } from 'yfiles'

const a = 1
const gc = new GraphComponent()
/*TODO-Migration Signature changes in the signature of gc.zoomTo(new Point(0, 0), a), undefined placeholders have been inserted where needed.*/gc.zoomTo(a, new Point(0, 0), undefined/*should now be of type GraphComponent*/)
