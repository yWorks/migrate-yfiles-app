import { GraphComponent, ExteriorLabelModel } from 'yfiles'

const graph = new GraphComponent().graph
graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel().createParameter('south')
