import { GraphComponent, CompositeLabelModel } from 'yfiles'

const gc = new GraphComponent()
gc.graph.nodeDefaults.labels.layoutParameter = new CompositeLabelModel().parameters.first()
