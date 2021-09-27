import {
  EdgeRouterData,
  TransitiveEdge,
  DistanceMetric,
} from 'yfiles'

const gc = new GraphComponent()
new EdgeRouterData()
new yfiles.router.EdgeRouterData()
new foo.bar.PolylineEdgeRouterData()
class Foo extends EdgeRouterData {}

const listener = () => {
  console.log('hello')
}
gc.addContentMarginsChangedListener(listener)
gc.removeContentMarginsChangedListener(listener)
gc.contentMargins()
gc.ensureVisible([0, 0, 100, 100])
gc.apply()
