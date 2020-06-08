'use strict'

/** @type {yfiles.view.GraphComponent} */
let graphComponent = null

function run() {
  yfiles.workaroundCR320635 = detectSafari11Webkit()

  const firefoxVersion = detectFirefoxVersion()
  if (firefoxVersion !== -1) {
    yfiles.workaroundCR320635 = true
  }

  // initialize graph component
  graphComponent = new yfiles.view.GraphComponent('graphComponent')
  graphComponent.inputMode = new yfiles.input.GraphEditorInputMode()

  // initialize graph
  const graph = graphComponent.graph
  graph.undoEngineEnabled = true

  // initialize default styles
  graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
    fill: yfiles.view.Fill.ORANGE,
    stroke: yfiles.view.Stroke.ORANGE,
    shape: yfiles.styles.ShapeNodeShape.RECTANGLE
  })
  graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
    targetArrow: yfiles.styles.IArrow.DEFAULT
  })

  // create small sample graph
  const node1 = graph.createNode(new yfiles.geometry.Rect(50, 50, 30, 30))
  const node2 = graph.createNode(new yfiles.geometry.Rect(0, 150, 30, 30))
  const node3 = graph.createNode(new yfiles.geometry.Rect(100, 150, 30, 30))
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)

  // center graph
  graphComponent.fitGraphBounds()

  // initialize layout button
  const element = document.querySelector("button[data-command='Layout']")
  element.addEventListener('click', applyLayout.bind(this))
}

/**
 * Calculates a hierarchic layout for the current graph.
 */
function applyLayout() {
  graphComponent.morphLayout(
    new yfiles.layout.MinimumNodeSizeStage(new yfiles.hierarchic.HierarchicLayout()),
    yfiles.lang.TimeSpan.fromSeconds(1)
  )
}
