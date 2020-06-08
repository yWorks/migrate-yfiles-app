// this is what 2.0-2.1 looked like
'use strict'

/* eslint-disable global-require*/
/* eslint-disable no-new */

require.config({
  paths: {
    yfiles: '../../../lib/yfiles',
    demo: '../../resources'
  }
})

require([
  'yfiles/view-editor',
  'demo/demo-util',
  'demo/demo-context-menu',
  'demo/demo-dndpanel',
  './bpmn-view.js',
  './BpmnPopupSupport.js',
  'demo/license'
], (
  /**@type {yfiles_namespace}*/ /**typeof yfiles*/ yfiles,
  app,
  ContextMenu,
  DndPanel,
  BpmnView,
  BpmnPopup
) => {
  function run() {
    // initialize UI elements
    const graphComponent = new yfiles.view.GraphComponent('graphComponent')
    new yfiles.view.GraphOverviewComponent('overviewComponent', graphComponent)
    const graphChooserBox = document.getElementById('SampleComboBox')

    // load the folding and style modules and initialize the GraphComponent
    require(['yfiles/view-folding', 'yfiles/view-table'], () => {
      // initialize the graph component
      initializeGraphComponent()
      // initialize the input mode
      initializeInputMode()

      // load the graphml module with folding support and initialize
      // the graph chooser box and the style property popups
      require(['yfiles/view-graphml'], () => {
        const stylePanel = new DndPanel.DragAndDropPanel(
          document.getElementById('stylePanel'),
          app.passiveSupported
        )
        // Set the callback that starts the actual drag and drop operation
        stylePanel.beginDragCallback = (element, data) => {
          if (yfiles.graph.IStripe.isInstance(data)) {
            yfiles.input.StripeDropInputMode.startDrag(
              element,
              data,
              yfiles.view.DragDropEffects.ALL
            )
          } else {
            yfiles.input.NodeDropInputMode.startDrag(element, data, yfiles.view.DragDropEffects.ALL)
          }
        }
        stylePanel.maxItemWidth = 140
        stylePanel.populatePanel(createStylePanelNodes)

        // initialize (de-)serialization for load/save commands
        const graphmlSupport = new yfiles.graphml.GraphMLSupport({
          graphComponent,
          // configure to load and save to the file system
          storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM
        })
        const graphmlHandler = new yfiles.graphml.GraphMLIOHandler()
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
      })
    })

    app.show(graphComponent)
  }

  /**
   * Helper method that tries to layout the current graph using the BpmnLayout.
   */
  function onLayoutButtonClicked() {
    require(['BpmnLayout.js', 'BpmnLayoutData.js', 'yfiles/view-layout-bridge'], (
      BpmnLayout,
      BpmnLayoutData
    ) => {
      // Create a new BpmnLayout using a left-to-right layout orientation
      const bpmnLayout = new BpmnLayout()
      bpmnLayout.scope = 'ALL_ELEMENTS'
      bpmnLayout.layoutOrientation = 'LEFT_TO_RIGHT'

      const bpmnLayoutData = new BpmnLayoutData()
      bpmnLayoutData.compactMessageFlowLayering = false
      bpmnLayoutData.startNodesFirst = true

      const layoutExecutor = new yfiles.layout.LayoutExecutor(graphComponent, bpmnLayout)
      layoutExecutor.layoutData = bpmnLayoutData
      layoutExecutor.duration = yfiles.lang.TimeSpan.fromMilliseconds(500)
      layoutExecutor.animateViewport = true
      layoutExecutor.updateContentRect = true
      layoutExecutor.tableLayoutConfigurator.horizontalLayout = true
      layoutExecutor.tableLayoutConfigurator.fromSketch = true
      layoutExecutor.start().then(() => {})
    })
  }

  // start the demo
  run()
})
