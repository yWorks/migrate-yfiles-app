require('../../../resources/license.js')
const GraphToJSON = require('../GraphToJSON.js')
// All yfiles modules return the yfiles namespace object
const yfiles = require('../../../../lib/yfiles/view-component')
require('../../../../lib/yfiles/layout-hierarchic')
require('../../../../lib/yfiles/view-layout-bridge')

const foo = "zfiles"
require(foo)

// Create a minimal Express server
const express = require('express')
const bodyParser = require('body-parser')
// to read the JSON data passed as POST body
const app = express()

function runLayout(inputGraph) {
  const graph = GraphToJSON.read(inputGraph)

  const layout = new yfiles.hierarchic.HierarchicLayout()
  layout.minimumNodeDistance = 50
  graph.applyLayout(new yfiles.layout.MinimumNodeSizeStage(layout))

  return GraphToJSON.write(graph)
}

function checkLicense() {
  const g = new yfiles.graph.DefaultGraph()
  g.createNode()
  return g.nodes.size > 0
}
