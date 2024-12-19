import {
  DefaultGraph,
  GraphComponent,
  GraphCopier,
  type IEdge,
  type ILabel,
  type IModelItem,
  type INode,
  Point
} from 'yfiles'

const gc = new GraphComponent()
const copier = new GraphCopier()
const copiedGraph = new DefaultGraph()
const mapping = new Map<IModelItem, INode | IEdge | ILabel>()
copier.copy(
  gc.graph,
  () => true,
  copiedGraph,
  Point.ORIGIN,
  (original, copy) => {
    mapping.set(copy, original as INode | IEdge | ILabel)
  }
)
