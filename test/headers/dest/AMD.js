import {
  DragDropEffects,
  GraphComponent,
  GraphMLIOHandler,
  GraphMLSupport,
  GraphOverviewComponent,
  IStripe,
  LayoutExecutor,
  NodeDropInputMode,
  StorageLocation,
  StripeDropInputMode,
  TimeSpan,
} from "yfiles";

import BpmnLayoutData from "./BpmnLayoutData.js";
import BpmnLayout from "./BpmnLayout.js";
import "../../resources/license.js";
import BpmnPopup from "./BpmnPopupSupport.js";
import BpmnView from "./bpmn-view.js";
import DndPanel from "../../resources/demo-dndpanel.js";
import ContextMenu from "../../resources/demo-context-menu.js";
import app from "../../resources/demo-util.js";
function run() {
  // initialize UI elements
  const graphComponent = new GraphComponent('graphComponent')
  new GraphOverviewComponent('overviewComponent', graphComponent)
  const graphChooserBox = document.getElementById('SampleComboBox')

  // load the folding and style modules and initialize the GraphComponent
  initializeGraphComponent()
  // initialize the input mode
  initializeInputMode()

  // load the graphml module with folding support and initialize
  // the graph chooser box and the style property popups
  const stylePanel = new DndPanel.DragAndDropPanel(
    document.getElementById('stylePanel'),
    app.passiveSupported
  );
  // Set the callback that starts the actual drag and drop operation
  stylePanel.beginDragCallback = (element, data) => {
    if (IStripe.isInstance(data)) {
      StripeDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL
      )
    } else {
      NodeDropInputMode.startDrag(element, data, DragDropEffects.ALL)
    }
  }
  stylePanel.maxItemWidth = 140
  stylePanel.populatePanel(createStylePanelNodes)

  // initialize (de-)serialization for load/save commands
  const graphmlSupport = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })
  const graphmlHandler = new GraphMLIOHandler()
  graphmlHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/xml/yfiles-bpmn/1.0',
    BpmnView
  )
  graphmlHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0',
    BpmnView
  )
  graphmlHandler.addNamespace('http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0', 'bpmn')
  graphmlHandler.addHandleSerializationListener(BpmnView.BpmnHandleSerializationListener)
  graphmlSupport.graphMLIOHandler = graphmlHandler

  // load initial graph
  app.readGraph(graphmlHandler, graphComponent.graph, 'resources/business.graphml', () => {
    graphComponent.fitGraphBounds()
    graphComponent.graph.undoEngine.clear()
  })

  // bind commands to UI input elements
  registerCommands()
  // initialize UI elements that belong to the popups
  initializePopups()

  app.show(graphComponent)
}

/**
 * Helper method that tries to layout the current graph using the BpmnLayout.
 */
function onLayoutButtonClicked() {
  const bpmnLayout = new BpmnLayout();
  bpmnLayout.scope = 'ALL_ELEMENTS'
  bpmnLayout.layoutOrientation = 'LEFT_TO_RIGHT'

  const bpmnLayoutData = new BpmnLayoutData()
  bpmnLayoutData.compactMessageFlowLayering = false
  bpmnLayoutData.startNodesFirst = true

  const layoutExecutor = new LayoutExecutor(graphComponent, bpmnLayout)
  layoutExecutor.layoutData = bpmnLayoutData
  layoutExecutor.duration = TimeSpan.fromMilliseconds(500)
  layoutExecutor.animateViewport = true
  layoutExecutor.updateContentRect = true
  layoutExecutor.tableLayoutConfigurator.horizontalLayout = true
  layoutExecutor.tableLayoutConfigurator.fromSketch = true
  layoutExecutor.start().then(() => {})
}

// start the demo
run()
