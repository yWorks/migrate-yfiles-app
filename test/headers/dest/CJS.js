const {
  DefaultGraph,
  HierarchicLayout,
  MinimumNodeSizeStage
} = require("yfiles");

require('../../../resources/license.js')
const GraphToJSON = require('../GraphToJSON.js')

// Create a minimal Express server
const express = require('express')
const bodyParser = require('body-parser')
// to read the JSON data passed as POST body
const app = express()

function runLayout(inputGraph) {
  const graph = GraphToJSON.read(inputGraph)

  const layout = new HierarchicLayout()
  layout.minimumNodeDistance = 50
  graph.applyLayout(new MinimumNodeSizeStage(layout))

  return GraphToJSON.write(graph)
}

function checkLicense() {
  const g = new DefaultGraph()
  g.createNode()
  return g.nodes.size > 0
}
