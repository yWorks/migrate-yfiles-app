import {
  Fill,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  IArrow,
  MinimumNodeSizeStage,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  Stroke,
  TimeSpan,
} from "yfiles";

/** @type {GraphComponent} */
let graphComponent = null

function run() {
  yfiles.workaroundCR320635 = detectSafari11Webkit()

  const firefoxVersion = detectFirefoxVersion()
  if (firefoxVersion !== -1) {
    yfiles.workaroundCR320635 = true
  }

  // initialize graph component
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()

  // initialize graph
  const graph = graphComponent.graph
  graph.undoEngineEnabled = true

  // initialize default styles
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: Fill.ORANGE,
    stroke: Stroke.ORANGE,
    shape: ShapeNodeShape.RECTANGLE
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    targetArrow: IArrow.DEFAULT
  })

  // create small sample graph
  const node1 = graph.createNode(new Rect(50, 50, 30, 30))
  const node2 = graph.createNode(new Rect(0, 150, 30, 30))
  const node3 = graph.createNode(new Rect(100, 150, 30, 30))
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
    new MinimumNodeSizeStage(new HierarchicLayout()),
    TimeSpan.fromSeconds(1)
  )
}
