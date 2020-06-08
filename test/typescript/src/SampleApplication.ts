interface GraphComponent {
  graph: IGraph
}

interface IGraph {
  nodeDefaults: any
}

class InteriorLabelModel {
  static CENTER: any
}

function setDefaultLabelParameters () {
  let graphComponent: GraphComponent = null!
  const graph: IGraph = graphComponent.graph
  // For node labels, the default is a label position at the node center
  // Let's keep the default.  Here is how to set it manually
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER

  const edgeLabelModel = new EdgePathLabelModel({
    autoRotationEnabled: true,
  })
}
