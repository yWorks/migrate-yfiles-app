import * as yfiles_module_demo from "yfiles.module('demo')";

import {
  AssistantNodePlacer,
  ChildPlacement,
  Color,
  DefaultNodePlacer,
  FilteredGraphWrapper,
  FixNodeLayoutStage,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  IEdge,
  IGraph,
  INode,
  ITreeLayoutNodePlacer,
  Insets,
  Key,
  LayoutExecutor,
  LeftRightNodePlacer,
  Point,
  PolylineEdgeStyle,
  RootAlignment,
  ShowFocusPolicy,
  Size,
  SolidColorFill,
  Stroke,
  TemplateNodeStyle,
  TreeLayout,
  TreeLayoutEdgeRoutingStyle,
  YBoolean,
  delegate,
} from "yfiles";

/****************************************************************************
 **
 ** This demo file is part of yFiles for HTML 1.3.0.7.
 ** Copyright (c) 2000-2017 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
(function(r){
  /**
   * @class demo.OrgChartDemo
   * @extends {demo.Application}
   */
  export const OrgChartDemo = class OrgChartDemo extends demo.Application {
    constructor() {
      super();

      /** @type {yfiles.canvas.GraphControl} */
      this.graphControl = null;

      /** @type {yfiles.canvas.GraphOverviewControl} */
      this.overviewControl = null;

      /** @type {demo.OrgChartPropertiesView} */
      this.propertiesView = null;

      /**
             * Used by the predicate function to determine which nodes should not be shown.
             * @type {yfiles.collections.HashSet.<INode>}
             * @private
             */
      this.hiddenNodesSet = null;

      /**
             * @type {FilteredGraphWrapper}
             * @private
             */
      this.filteredGraphWrapper = null;

      /**
       * @type {boolean}
       * @private
       */
      this.doingLayout = false;

      this.hiddenNodesSet = new yfiles.collections.HashSet/**.<INode>*/();
    }

    loaded() {
      this.registerElementDefaults(this.graphComponent.graph);

      this.graphComponent.focusIndicatorManager.showFocusPolicy = ShowFocusPolicy.ALWAYS;

      this.graphComponent.selectionIndicatorManager.enabled = false;
      this.graphComponent.focusIndicatorManager.enabled = false;
      this.graphComponent.highlightIndicatorManager.enabled = false;

      this.initializeCustomCommandBindings();
      this.initializeInputMode();

      this.overviewControl.graphComponent = this.graphComponent;

      this.createAdditionalComponents();

      this.graphComponent.addCurrentItemChangedListener((sender, /**yfiles.system.PropertyChangedEventArgs*/ args) => {
        this.propertiesView.showProperties((/**@type {INode}*/(this.graphComponent.currentItem)));
      });
    }

    /** @private */
    createAdditionalComponents() {
      // Create the properties view that populates the "propertiesView" element with 
      // the properties of the selected employee.
      const propertiesViewElement = (/**@type {HTMLElement}*/(document.getElementById("propertiesView")));
      this.propertiesView = new demo.OrgChartPropertiesView(propertiesViewElement, this);
    }

    /**
     * Registers the JavaScript commands for the GUI elements, typically the
     * tool bar buttons, during the creation of this application.
     */
    registerCommands() {
      this.setProperty("ZoomIn", new demo.ApplicationCommand(ICommand.INCREASE_ZOOM, this.graphComponent));
      this.setProperty("ZoomOut", new demo.ApplicationCommand(ICommand.DECREASE_ZOOM, this.graphComponent));
      this.setProperty("FitContent", new demo.ApplicationCommand(GraphComponent.FIT_GRAPH_BOUNDS_COMMAND, this.graphComponent));
      this.setProperty("ZoomOriginal", new demo.ActionCommand(() => {
        ICommand.ZOOM.executeOnTarget(1.0, this.graphComponent);
      }));

      this.setProperty("HideChildren", new demo.ApplicationCommand(demo.OrgChartDemo.HIDE_CHILDREN_COMMAND, this.graphComponent));
      this.setProperty("ShowChildren", new demo.ApplicationCommand(demo.OrgChartDemo.SHOW_CHILDREN_COMMAND, this.graphComponent));
      this.setProperty("HideParent", new demo.ApplicationCommand(demo.OrgChartDemo.HIDE_PARENT_COMMAND, this.graphComponent));
      this.setProperty("ShowParent", new demo.ApplicationCommand(demo.OrgChartDemo.SHOW_PARENT_COMMAND, this.graphComponent));
      this.setProperty("ShowAll", new demo.ApplicationCommand(demo.OrgChartDemo.SHOW_ALL_COMMAND, this.graphComponent));

      this.setProperty("Print", new demo.ActionCommand(delegate(this.print, this)));
    }

    /** @private */
    initializeCustomCommandBindings() {
      this.graphComponent.commandBindings.add(new yfiles.system.CommandBinding(demo.OrgChartDemo.HIDE_CHILDREN_COMMAND, delegate(this.hideChildrenExecuted, this), delegate(this.canExecuteHideChildren, this)));
      this.graphComponent.commandBindings.add(new yfiles.system.CommandBinding(demo.OrgChartDemo.SHOW_CHILDREN_COMMAND, delegate(this.showChildrenExecuted, this), delegate(this.canExecuteShowChildren, this)));
      this.graphComponent.commandBindings.add(new yfiles.system.CommandBinding(demo.OrgChartDemo.HIDE_PARENT_COMMAND, delegate(this.hideParentExecuted, this), delegate(this.canExecuteHideParent, this)));
      this.graphComponent.commandBindings.add(new yfiles.system.CommandBinding(demo.OrgChartDemo.SHOW_PARENT_COMMAND, delegate(this.showParentExecuted, this), delegate(this.canExecuteShowParent, this)));
      this.graphComponent.commandBindings.add(new yfiles.system.CommandBinding(demo.OrgChartDemo.SHOW_ALL_COMMAND, delegate(this.showAllExecuted, this), delegate(this.canExecuteShowAll, this)));

      this.graphComponent.inputBindings.add(new yfiles.system.InputBinding(demo.OrgChartDemo.HIDE_CHILDREN_COMMAND, new yfiles.system.KeyGesture(Key.SUBTRACT)));
      this.graphComponent.inputBindings.add(new yfiles.system.InputBinding(demo.OrgChartDemo.SHOW_CHILDREN_COMMAND, new yfiles.system.KeyGesture(Key.ADD)));
      this.graphComponent.inputBindings.add(new yfiles.system.InputBinding(demo.OrgChartDemo.HIDE_PARENT_COMMAND, new yfiles.system.KeyGesture(Key.PAGE_DOWN)));
      this.graphComponent.inputBindings.add(new yfiles.system.InputBinding(demo.OrgChartDemo.SHOW_PARENT_COMMAND, new yfiles.system.KeyGesture(Key.PAGE_UP)));
      this.graphComponent.inputBindings.add(new yfiles.system.InputBinding(demo.OrgChartDemo.SHOW_ALL_COMMAND, new yfiles.system.KeyGesture(Key.MULTIPLY)));

    }

    /** @private */
    initializeInputMode() {
      const graphViewerInputMode = new GraphViewerInputMode();
      graphViewerInputMode.clickableItems = GraphItemTypes.NODE;
      graphViewerInputMode.selectableItems = GraphItemTypes.NONE;
      graphViewerInputMode.marqueeSelectableItems = GraphItemTypes.NONE;
      graphViewerInputMode.toolTipItems = GraphItemTypes.NONE;
      graphViewerInputMode.contextMenuItems = GraphItemTypes.NONE;
      graphViewerInputMode.focusableItems = GraphItemTypes.NODE;

      graphViewerInputMode.addItemDoubleClickedListener(delegate(this.onItemDoubleClicked, this));
      this.graphComponent.inputMode = graphViewerInputMode;
    }

    /** @private */
    onItemDoubleClicked(sender, /**yfiles.support.ItemInputEventArgs.<yfiles.model.IModelItem>*/ e) {
      this.zoomToCurrentItem();
    }

    /** @private */
    registerElementDefaults(/**IGraph*/ graph) {
      graph.nodeDefaults.style = new demo.LevelOfDetailNodeStyle(new TemplateNodeStyle("detailNodeStyleTemplate"), new TemplateNodeStyle("intermediateNodeStyleTemplate"), new TemplateNodeStyle("overviewNodeStyleTemplate"));
      graph.nodeDefaults.size = new Size(285, 100);
      const newPolylineEdgeStyle = new PolylineEdgeStyle();
      newPolylineEdgeStyle.pen = new Stroke.FromBrushAndThickness(new SolidColorFill(Color.fromArgb(255, 170, 170, 170)), 2);
      newPolylineEdgeStyle.targetArrow = IArrow.NONE;
      graph.edgeDefaults.style = newPolylineEdgeStyle;

    }

    /** @type {IGraph} */
    get graph() {
      return this.graphComponent.graph;
    }

    selectAndZoomToNode(/**INode*/ node) {
      this.graphComponent.currentItem = node;
      this.zoomToCurrentItem();
      this.graphComponent.focus();
    }

    /**
           * Returns the node representing the employee with the specified E-Mail address.
           * @return {INode}
           */
    getNodeForEMail(/**string*/ email) {
      if (email === null) {
        return null;
      }

      return this.filteredGraphWrapper.wrappedGraph.nodes.firstOrDefault(/**INode*/ node => node.tag !== null && email === ((/**@type {demo.Employee}*/(node.tag))).email);
    }

    /**
     * Selects and zooms to the node representing the employee with the specified E-Mail address.
     */
    selectAndZoomToNodeWithEmail(/**string*/ email) {
      const nodeForEMail = this.getNodeForEMail(email);
      if (null !== nodeForEMail) {
        this.selectAndZoomToNode(nodeForEMail);
      }
    }

    /**
     * Adds a "parent" reference to all subordinates contained in the source data.
     * The parent reference is needed to create the colleague and parent links 
     * in the properties view.
     * @param {Object} nodesSourceItem The source data in JSON format
     * @private
     */
    addParentReferences(nodesSourceItem) {
      const subs = (/**@type {Object[]}*/(nodesSourceItem["subordinates"]));
      if (subs !== undefined) {
        let /**number*/ i;
        for (i = 0; i < subs.length; i++) {
          const sub = subs[i];
          sub["parent"] = nodesSourceItem;
          this.addParentReferences(sub);
        }
      }

    }

    /**
     * Create the graph using a TreeSource.
     * @param {Object} nodesSource The source data in JSON format
     */
    createGraph(nodesSource) {
      this.addParentReferences(((/**@type {Object[]}*/(nodesSource)))[0]);

      const treeSource = new yfiles.binding.TreeSource();
      treeSource.childBinding = "subordinates";
      treeSource.nodesSource = nodesSource;


      this.registerElementDefaults(treeSource.graph);

      this.filteredGraphWrapper = new FilteredGraphWrapper(treeSource.buildGraph(), delegate(this.shouldShowNode, this), /**IEdge*/ e => true);
      this.graphComponent.graph = this.filteredGraphWrapper;

      this.applyLayout();

      this.graphComponent.fitGraphBounds();
      this.limitViewport();
    }

    /**
     * Setup a ViewportLimiter that makes sure that the explorable region
     * doesn't exceed the graph size.
     * @private
     */
    limitViewport() {
      this.graphComponent.updateContentRect(new Insets(100));
      const limiter = this.graphComponent.viewportLimiter;
      limiter.honorBothDimensions = false;
      limiter.bounds = this.graphComponent.contentRect;
    }

    /**
           * The predicate used for the FilterGraphWrapper.
           * @param {INode} obj 
           * @return {boolean} 
           * @private
           */
    shouldShowNode(/**INode*/ obj) {
      return !this.hiddenNodesSet.contains(obj);
    }

    // #region Tree Layout Configuration and initial execution

    /**
     * Does a tree layout of the Graph provided by the <code>TreeDataBuilder</code>.
     * The layout and assistant attributes from the business data of the employees are used to
     * guide the the layout.
     */
    doLayout() {
      const tree = this.graphComponent.graph;

      this.configureLayout(tree);
      new TreeLayout().applyLayout(tree);
      this.cleanUp(tree);
    }

    /** @private */
    configureLayout(/**IGraph*/ tree) {
      const registry = tree.mapperRegistry;

      const nodePlacerMapper = registry.createMapper(INode.$class, ITreeLayoutNodePlacer.$class, TreeLayout.NODE_PLACER_DP_KEY);
      const assistantMapper = registry.createMapper(INode.$class, YBoolean.$class, AssistantNodePlacer.ASSISTANT_NODE_DP_KEY);

      tree.nodes.forEach(/**INode*/ node => {
        if (tree.inDegree(node) === 0) {
          this.setNodePlacers(node, nodePlacerMapper, assistantMapper, tree);
        }
      });
    }

    /** @private */
    setNodePlacers(
      /**INode*/ rootNode,
      /**yfiles.model.IMapper.<INode, ITreeLayoutNodePlacer>*/ nodePlacerMapper,
      /**yfiles.model.IMapper.<INode, boolean>*/ assistantMapper,
      /**IGraph*/ tree
    ) {
      const employee = (/**@type {demo.Employee}*/(rootNode.tag));
      if (employee !== null) {
        const layout = employee.layout;
        switch (layout) {
          case "rightHanging":
            const newDefaultNodePlacer = new DefaultNodePlacer(ChildPlacement.VERTICAL_TO_RIGHT, RootAlignment.LEADING_ON_BUS, 30, 30);
            newDefaultNodePlacer.routingStyle = TreeLayoutEdgeRoutingStyle.FORK_AT_ROOT;
            nodePlacerMapper.setItem(rootNode, newDefaultNodePlacer);
            break;
          case "leftHanging":
            const newDefaultNodePlacer1 = new DefaultNodePlacer(ChildPlacement.VERTICAL_TO_LEFT, RootAlignment.LEADING_ON_BUS, 30, 30);
            newDefaultNodePlacer1.routingStyle = TreeLayoutEdgeRoutingStyle.FORK_AT_ROOT;
            nodePlacerMapper.setItem(rootNode, newDefaultNodePlacer1);
            break;
          case "bothHanging":
            const newLeftRightPlacer = new LeftRightNodePlacer();
            newLeftRightPlacer.placeLastOnBottom = false;
            nodePlacerMapper.setItem(rootNode, newLeftRightPlacer);
            break;
          default:
            nodePlacerMapper.setItem(rootNode, new DefaultNodePlacer(ChildPlacement.HORIZONTAL_DOWNWARD, RootAlignment.MEDIAN, 30, 30));
            break;
        }

        const assistant = employee.assistant;
        if (assistant && tree.inDegree(rootNode) > 0) {
          const inEdge = tree.inEdgesAt(rootNode).getItem(0);
          const parent = inEdge.getSourceNode;
          const oldParentPlacer = nodePlacerMapper.getItem(parent);
          const assistantPlacer = new AssistantNodePlacer();
          assistantPlacer.childNodePlacer = oldParentPlacer;
          nodePlacerMapper.setItem(parent, assistantPlacer);
          assistantMapper.setItem(rootNode, true);
        }
      }

      tree.outEdgesAt(rootNode).forEach(/**IEdge*/ outEdge => {
        const child = (/**@type {INode}*/(outEdge.targetPort.owner));
        this.setNodePlacers(child, nodePlacerMapper, assistantMapper, tree);
      });
    }

    /** @private */
    cleanUp(/**IGraph*/ graph) {
      const registry = graph.mapperRegistry;
      registry.removeMapper(AssistantNodePlacer.ASSISTANT_NODE_DP_KEY);
      registry.removeMapper(TreeLayout.NODE_PLACER_DP_KEY);
    }

    // #endregion Tree Layout Configuration and initial execution

    // #region Command Binding Helper methods

    /**
     * Helper method that determines whether the {@link demo.OrgChartDemo#SHOW_PARENT_COMMAND} can be executed.
     */
    canExecuteShowChildren(sender, /**yfiles.system.CanExecuteRoutedEventArgs*/ e) {
      const param = e.parameter;
      const item = param !== null ? param : this.graphComponent.currentItem;
      if (INode.isInstance(item) && !this.doingLayout && this.filteredGraphWrapper !== null) {
        e.canExecute = this.filteredGraphWrapper.outDegree((/**@type {INode}*/(item))) !== this.filteredGraphWrapper.wrappedGraph.outDegree((/**@type {INode}*/(item)));
      } else {
        e.canExecute = false;
      }
      e.handled = true;
    }

    /**
     * Handler for the {@link demo.OrgChartDemo#SHOW_CHILDREN_COMMAND}.
     */
    showChildrenExecuted(sender, /**yfiles.system.ExecutedRoutedEventArgs*/ e) {
      const param = e.parameter;
      const item = param !== null ? param : this.graphComponent.currentItem;
      if (INode.isInstance(item) && !this.doingLayout) {
        const count = this.hiddenNodesSet.count;
        this.filteredGraphWrapper.wrappedGraph.outEdgesAt((/**@type {INode}*/(item))).forEach(/**IEdge*/ childEdge => {
          const child = childEdge.getTargetNode;
          if (this.hiddenNodesSet.remove(child)) {
            this.filteredGraphWrapper.wrappedGraph.setCenter(child, ((/**@type {INode}*/(item))).layout.getRectangleCenter());
            this.filteredGraphWrapper.wrappedGraph.clearBends(childEdge);
          }
        });
        this.refreshLayout(count, (/**@type {INode}*/(item)));
      }
    }

    /**
     * Helper method that determines whether the {@link demo.OrgChartDemo#SHOW_PARENT_COMMAND} can be executed.
     * @private
     */
    canExecuteShowParent(sender, /**yfiles.system.CanExecuteRoutedEventArgs*/ e) {
      const param = e.parameter;
      const item = param !== null ? param : this.graphComponent.currentItem;
      if (INode.isInstance(item) && !this.doingLayout && this.filteredGraphWrapper !== null) {
        e.canExecute = this.filteredGraphWrapper.inDegree((/**@type {INode}*/(item))) === 0 && this.filteredGraphWrapper.wrappedGraph.inDegree((/**@type {INode}*/(item))) > 0;
      } else {
        e.canExecute = false;
      }
      e.handled = true;
    }

    /**
     * Handler for the {@link demo.OrgChartDemo#SHOW_PARENT_COMMAND}.
     * @private
     */
    showParentExecuted(sender, /**yfiles.system.ExecutedRoutedEventArgs*/ e) {
      const param = e.parameter;
      const item = param !== null ? param : this.graphComponent.currentItem;
      if (INode.isInstance(item) && !this.doingLayout) {
        const count = this.hiddenNodesSet.count;
        this.filteredGraphWrapper.wrappedGraph.inEdgesAt((/**@type {INode}*/(item))).forEach(/**IEdge*/ parentEdge => {
          const parent = parentEdge.getSourceNode;
          if (this.hiddenNodesSet.remove(parent)) {
            this.filteredGraphWrapper.wrappedGraph.setCenter(parent, ((/**@type {INode}*/(item))).layout.getRectangleCenter());
            this.filteredGraphWrapper.wrappedGraph.clearBends(parentEdge);
          }
        });
        this.refreshLayout(count, (/**@type {INode}*/(item)));
      }
    }

    /**
     * Helper method that determines whether the {@link demo.OrgChartDemo#HIDE_PARENT_COMMAND} can be executed.
     * @private
     */
    canExecuteHideParent(sender, /**yfiles.system.CanExecuteRoutedEventArgs*/ e) {
      const param = e.parameter;
      const item = param !== null ? param : this.graphComponent.currentItem;
      if (INode.isInstance(item) && !this.doingLayout && this.filteredGraphWrapper !== null) {
        e.canExecute = this.filteredGraphWrapper.inDegree((/**@type {INode}*/(item))) > 0;
      } else {
        e.canExecute = false;
      }
      e.handled = true;
    }

    /**
     * Handler for the {@link demo.OrgChartDemo#HIDE_PARENT_COMMAND}.
     * @private
     */
    hideParentExecuted(sender, /**yfiles.system.ExecutedRoutedEventArgs*/ e) {
      const param = e.parameter;
      const item = param !== null ? param : this.graphComponent.currentItem;
      if (INode.isInstance(item) && !this.doingLayout) {
        const count = this.hiddenNodesSet.count;

        this.filteredGraphWrapper.wrappedGraph.nodes.forEach(/**INode*/ testNode => {
          if (testNode !== item && this.filteredGraphWrapper.contains(testNode) && this.filteredGraphWrapper.inDegree(testNode) === 0) {
            // this is a root node - remove it and all children unless 
            this.hideAllExcept(testNode, (/**@type {INode}*/(item)));
          }
        });
        this.refreshLayout(count, (/**@type {INode}*/(item)));
      }
    }

    /**
     * Helper method that determines whether the {@link demo.OrgChartDemo#HIDE_CHILDREN_COMMAND} can be executed.
     * @private
     */
    canExecuteHideChildren(sender, /**yfiles.system.CanExecuteRoutedEventArgs*/ e) {
      const param = e.parameter;
      const item = param !== null ? param : this.graphComponent.currentItem;
      if (INode.isInstance(item) && !this.doingLayout && this.filteredGraphWrapper !== null) {
        e.canExecute = this.filteredGraphWrapper.outDegree((/**@type {INode}*/(item))) > 0;
      } else {
        e.canExecute = false;
      }
      e.handled = true;
    }

    /**
     * Handler for the {@link demo.OrgChartDemo#HIDE_CHILDREN_COMMAND}.
     * @private
     */
    hideChildrenExecuted(sender, /**yfiles.system.ExecutedRoutedEventArgs*/ e) {
      const param = e.parameter;
      const item = param !== null ? param : this.graphComponent.currentItem;
      if (INode.isInstance(item) && !this.doingLayout) {
        const count = this.hiddenNodesSet.count;
        this.filteredGraphWrapper.outEdgesAt((/**@type {INode}*/(item))).forEach(/**IEdge*/ child => {
          this.hideAllExcept((/**@type {INode}*/(child.targetPort.owner)), (/**@type {INode}*/(item)));
        });
        this.refreshLayout(count, (/**@type {INode}*/(item)));
      }
    }

    /**
     * Helper method that determines whether the {@link demo.OrgChartDemo#SHOW_PARENT_COMMAND} can be executed.
     * @private
     */
    canExecuteShowAll(sender, /**yfiles.system.CanExecuteRoutedEventArgs*/ e) {
      e.canExecute = this.filteredGraphWrapper !== null && this.hiddenNodesSet.count !== 0 && !this.doingLayout;
      e.handled = true;
    }

    /**
     * Handler for the {@link demo.OrgChartDemo#SHOW_ALL_COMMAND}.
     * @private
     */
    showAllExecuted(sender, /**yfiles.system.ExecutedRoutedEventArgs*/ e) {
      if (!this.doingLayout) {
        this.hiddenNodesSet.clear();
        this.refreshLayout(-1, (/**@type {INode}*/(this.graphComponent.currentItem)));
      }
    }

    /** @private */
    refreshLayout(/**number*/ count, /**INode*/ centerNode) {
      if (this.doingLayout) {
        return;
      }
      this.doingLayout = true;
      if (count !== this.hiddenNodesSet.count) {
        // tell our filter to refresh the graph
        this.filteredGraphWrapper.nodePredicateChanged();
        // the commands CanExecute state might have changed - suggest a requery.
        yfiles.system.CommandManager.invalidateRequerySuggested();

        // now layout the graph in animated fashion
        const tree = this.graphComponent.graph;

        // we mark a node as the center node
        this.graphComponent.graph.mapperRegistry.createDelegateMapper(INode.$class, YBoolean.$class, FixNodeLayoutStage.FIXED_NODE_DP_KEY, /**INode*/ node => node === centerNode);
        // configure the tree layout
        this.configureLayout(tree);

        // create the layouter (with a stage that fixes the center node in the coordinate system)
        const layouter = new FixNodeLayoutStage.WithCoreLayouter(new TreeLayout());

        // configure a LayoutExecutor
        const executor = new LayoutExecutor(this.graphComponent, layouter);
        executor.animateViewport = centerNode === null;
        executor.easedAnimation = true;
        executor.updateContentRect = true;
        executor.duration = yfiles.system.TimeSpan.fromMilliseconds(500);

        executor.start().then((sender, /**yfiles.system.EventArgs*/ args) => {
          this.graphComponent.graph.mapperRegistry.removeMapper(FixNodeLayoutStage.FIXED_NODE_DP_KEY);
          this.cleanUp(tree);
          this.doingLayout = false;
          this.limitViewport();
          if (args instanceof yfiles.graph.LayoutExceptionEventArgs) {
            const exception = ((/**@type {yfiles.graph.LayoutExceptionEventArgs}*/(args))).exception;
            demo.Application.handleError(exception, exception.message, 0);
          }
        });
      }
    }

    // #endregion Command Binding Helper methods

    /**
     * Helper method that hides all nodes and its descendants except for a given node.
     * @private
     */
    hideAllExcept(/**INode*/ nodeToHide, /**INode*/ exceptNode) {
      this.hiddenNodesSet.add(nodeToHide);
      this.filteredGraphWrapper.wrappedGraph.outEdgesAt(nodeToHide).forEach(/**IEdge*/ edge => {
        const child = (/**@type {INode}*/(edge.targetPort.owner));
        if (exceptNode !== child) {
          this.hideAllExcept(child, exceptNode);
        }
      });
    }

    /** @private */
    zoomToCurrentItem() {
      const currentItem = this.graphComponent.currentItem;

      if (INode.isInstance(currentItem)) {
        // visible current item
        if (this.graphComponent.graph.contains(currentItem)) {
          GraphComponent.ZOOM_TO_CURRENT_ITEM_COMMAND.executeOnTarget(null, this.graphComponent);
        } else {
          // see if it can be made visible
          if (this.filteredGraphWrapper.wrappedGraph.nodes.contains((/**@type {INode}*/(currentItem)))) {
            // uhide all nodes...
            this.hiddenNodesSet.clear();
            // except the node to be displayed and all its descendants
            this.filteredGraphWrapper.wrappedGraph.nodes.forEach(/**INode*/ testNode => {
              if (testNode !== currentItem && this.filteredGraphWrapper.wrappedGraph.inDegree(testNode) === 0) {
                this.hideAllExcept(testNode, (/**@type {INode}*/(currentItem)));
              }
            });
            // reset the layout to make the animation nicer
            this.filteredGraphWrapper.nodes.forEach(/**INode*/ n => {
              this.filteredGraphWrapper.setCenter(n, Point.ORIGIN);
            });
            this.filteredGraphWrapper.edges.forEach(/**IEdge*/ edge => {
              this.filteredGraphWrapper.clearBends(edge);
            });
            this.refreshLayout(-1, null);
          }
        }
      }
    }

    /**
     * Prints the graph, separated in tiles.
     */
    print() {
      const printingSupport = new demo.OrgChartPrintingSupport();
      printingSupport.tiledPrinting = true;
      printingSupport.scale = 0.29;
      printingSupport.margin = 1;
      printingSupport.tileWidth = 842;
      printingSupport.tileHeight = 595;
      printingSupport.print(this.graphComponent, null);
    }

    /** @return {INode} */
    static getRootNode(/**IGraph*/ graph) {
      return graph.nodes.firstOrDefault(/**INode*/ node => graph.inDegree(node) === 0);
    }
  };

  /**
           * The command that can be used to show the parent node.
           * This command requires the corresponding {@link INode} as the {@link yfiles.system.ExecutedRoutedEventArgs#parameter}.
           * @type {yfiles.system.RoutedUICommand}
           */
  OrgChartDemo.SHOW_PARENT_COMMAND = null;

  /**
           * The command that can be used to hide the parent node.
           * This command requires the corresponding {@link INode} as the {@link yfiles.system.ExecutedRoutedEventArgs#parameter}.
           * @type {yfiles.system.RoutedUICommand}
           */
  OrgChartDemo.HIDE_PARENT_COMMAND = null;

  /**
           * The command that can be used to show the child nodes.
           * This command requires the corresponding {@link INode} as the {@link yfiles.system.ExecutedRoutedEventArgs#parameter}.
           * @type {yfiles.system.RoutedUICommand}
           */
  OrgChartDemo.SHOW_CHILDREN_COMMAND = null;

  /**
           * The command that can be used to hide the child nodes.
           * This command requires the corresponding {@link INode} as the {@link yfiles.system.ExecutedRoutedEventArgs#parameter}.
           * @type {yfiles.system.RoutedUICommand}
           */
  OrgChartDemo.HIDE_CHILDREN_COMMAND = null;

  /**
   * The command that can be used to expand all collapsed nodes.
   * @type {yfiles.system.RoutedUICommand}
   */
  OrgChartDemo.SHOW_ALL_COMMAND = null;

  {
    demo.OrgChartDemo.SHOW_PARENT_COMMAND = new yfiles.system.RoutedUICommand.FromNameTypeAndInputGestures("Show Parent", "ShowParent", demo.OrgChartDemo.$class);
    demo.OrgChartDemo.HIDE_PARENT_COMMAND = new yfiles.system.RoutedUICommand.FromNameTypeAndInputGestures("Hide Parent", "HideParent", demo.OrgChartDemo.$class);
    demo.OrgChartDemo.SHOW_CHILDREN_COMMAND = new yfiles.system.RoutedUICommand.FromNameTypeAndInputGestures("Show Children", "ShowChildren", demo.OrgChartDemo.$class);
    demo.OrgChartDemo.HIDE_CHILDREN_COMMAND = new yfiles.system.RoutedUICommand.FromNameTypeAndInputGestures("Hide Children", "HideChildren", demo.OrgChartDemo.$class);
    demo.OrgChartDemo.SHOW_ALL_COMMAND = new yfiles.system.RoutedUICommand.FromNameTypeAndInputGestures("Show All", "ShowAll", demo.OrgChartDemo.$class);
  }
  export default yfiles_module_demo;
})("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this);
