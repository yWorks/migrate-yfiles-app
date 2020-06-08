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
(function(r){(function(f){if("function"==typeof define&&define.amd){define(['yfiles/lang','yfiles/core-lib'],f);}else{f(r.yfiles.lang,r.yfiles);}}(function(lang,yfiles){
yfiles.module("demo", function(exports) {
  /**
   * @class demo.OrgChartDemo
   * @extends {demo.Application}
   */
  exports.OrgChartDemo = new yfiles.ClassDefinition(function() {
    /** @lends {demo.OrgChartDemo.prototype} */
    return {
      '$extends': demo.Application,
      
      'constructor': function() {
        demo.Application.call(this);
        this.hiddenNodesSet = new yfiles.collections.HashSet/**.<yfiles.graph.INode>*/();
      },
      
      /** @type {yfiles.canvas.GraphControl} */
      'graphControl': null,
      
      /** @type {yfiles.canvas.GraphOverviewControl} */
      'overviewControl': null,
      
      /** @type {demo.OrgChartPropertiesView} */
      'propertiesView': null,
      
      'loaded': function() {
        this.registerElementDefaults(this.graphControl.graph);

        this.graphControl.focusPaintManager.showFocusPolicy = yfiles.model.ShowFocusPolicy.ALWAYS;

        this.graphControl.selectionPaintManager.enabled = false;
        this.graphControl.focusPaintManager.enabled = false;
        this.graphControl.highlightPaintManager.enabled = false;

        this.initializeCustomCommandBindings();
        this.initializeInputMode();

        this.overviewControl.graphControl = this.graphControl;

        this.createAdditionalComponents();

        this.graphControl.addCurrentItemChangedListener((function(sender, /**yfiles.system.PropertyChangedEventArgs*/ args) {
          this.propertiesView.showProperties((/**@type {yfiles.graph.INode}*/(this.graphControl.currentItem)));
        }).bind(this));
      },
      
      /** @private */
      'createAdditionalComponents': function() {
        // Create the properties view that populates the "propertiesView" element with 
        // the properties of the selected employee.
        var propertiesViewElement = (/**@type {HTMLElement}*/(document.getElementById("propertiesView")));
        this.propertiesView = new demo.OrgChartPropertiesView(propertiesViewElement, this);
      },
      
      /**
       * Registers the JavaScript commands for the GUI elements, typically the
       * tool bar buttons, during the creation of this application.
       */
      'registerCommands': function() {
        this.setProperty("ZoomIn", new demo.ApplicationCommand(yfiles.system.NavigationCommands.INCREASE_ZOOM, this.graphControl));
        this.setProperty("ZoomOut", new demo.ApplicationCommand(yfiles.system.NavigationCommands.DECREASE_ZOOM, this.graphControl));
        this.setProperty("FitContent", new demo.ApplicationCommand(yfiles.canvas.GraphControl.FIT_GRAPH_BOUNDS_COMMAND, this.graphControl));
        this.setProperty("ZoomOriginal", new demo.ActionCommand((function() {
          yfiles.system.NavigationCommands.ZOOM.executeOnTarget(1.0, this.graphControl);
        }).bind(this)));

        this.setProperty("HideChildren", new demo.ApplicationCommand(demo.OrgChartDemo.HIDE_CHILDREN_COMMAND, this.graphControl));
        this.setProperty("ShowChildren", new demo.ApplicationCommand(demo.OrgChartDemo.SHOW_CHILDREN_COMMAND, this.graphControl));
        this.setProperty("HideParent", new demo.ApplicationCommand(demo.OrgChartDemo.HIDE_PARENT_COMMAND, this.graphControl));
        this.setProperty("ShowParent", new demo.ApplicationCommand(demo.OrgChartDemo.SHOW_PARENT_COMMAND, this.graphControl));
        this.setProperty("ShowAll", new demo.ApplicationCommand(demo.OrgChartDemo.SHOW_ALL_COMMAND, this.graphControl));

        this.setProperty("Print", new demo.ActionCommand(yfiles.lang.delegate(this.print, this)));
      },
      
      /** @private */
      'initializeCustomCommandBindings': function() {
        this.graphControl.commandBindings.add(new yfiles.system.CommandBinding(demo.OrgChartDemo.HIDE_CHILDREN_COMMAND, yfiles.lang.delegate(this.hideChildrenExecuted, this), yfiles.lang.delegate(this.canExecuteHideChildren, this)));
        this.graphControl.commandBindings.add(new yfiles.system.CommandBinding(demo.OrgChartDemo.SHOW_CHILDREN_COMMAND, yfiles.lang.delegate(this.showChildrenExecuted, this), yfiles.lang.delegate(this.canExecuteShowChildren, this)));
        this.graphControl.commandBindings.add(new yfiles.system.CommandBinding(demo.OrgChartDemo.HIDE_PARENT_COMMAND, yfiles.lang.delegate(this.hideParentExecuted, this), yfiles.lang.delegate(this.canExecuteHideParent, this)));
        this.graphControl.commandBindings.add(new yfiles.system.CommandBinding(demo.OrgChartDemo.SHOW_PARENT_COMMAND, yfiles.lang.delegate(this.showParentExecuted, this), yfiles.lang.delegate(this.canExecuteShowParent, this)));
        this.graphControl.commandBindings.add(new yfiles.system.CommandBinding(demo.OrgChartDemo.SHOW_ALL_COMMAND, yfiles.lang.delegate(this.showAllExecuted, this), yfiles.lang.delegate(this.canExecuteShowAll, this)));

        this.graphControl.inputBindings.add(new yfiles.system.InputBinding(demo.OrgChartDemo.HIDE_CHILDREN_COMMAND, new yfiles.system.KeyGesture(yfiles.input.Key.SUBTRACT)));
        this.graphControl.inputBindings.add(new yfiles.system.InputBinding(demo.OrgChartDemo.SHOW_CHILDREN_COMMAND, new yfiles.system.KeyGesture(yfiles.input.Key.ADD)));
        this.graphControl.inputBindings.add(new yfiles.system.InputBinding(demo.OrgChartDemo.HIDE_PARENT_COMMAND, new yfiles.system.KeyGesture(yfiles.input.Key.PAGE_DOWN)));
        this.graphControl.inputBindings.add(new yfiles.system.InputBinding(demo.OrgChartDemo.SHOW_PARENT_COMMAND, new yfiles.system.KeyGesture(yfiles.input.Key.PAGE_UP)));
        this.graphControl.inputBindings.add(new yfiles.system.InputBinding(demo.OrgChartDemo.SHOW_ALL_COMMAND, new yfiles.system.KeyGesture(yfiles.input.Key.MULTIPLY)));

      },
      
      /** @private */
      'initializeInputMode': function() {
        var graphViewerInputMode = new yfiles.input.GraphViewerInputMode();
        graphViewerInputMode.clickableItems = yfiles.graph.GraphItemTypes.NODE;
        graphViewerInputMode.selectableItems = yfiles.graph.GraphItemTypes.NONE;
        graphViewerInputMode.marqueeSelectableItems = yfiles.graph.GraphItemTypes.NONE;
        graphViewerInputMode.toolTipItems = yfiles.graph.GraphItemTypes.NONE;
        graphViewerInputMode.contextMenuItems = yfiles.graph.GraphItemTypes.NONE;
        graphViewerInputMode.focusableItems = yfiles.graph.GraphItemTypes.NODE;

        graphViewerInputMode.addItemDoubleClickedListener(yfiles.lang.delegate(this.onItemDoubleClicked, this));
        this.graphControl.inputMode = graphViewerInputMode;
      },
      
      /** @private */
      'onItemDoubleClicked': function(sender, /**yfiles.support.ItemInputEventArgs.<yfiles.model.IModelItem>*/ e) {
        this.zoomToCurrentItem();
      },
      
      /** @private */
      'registerElementDefaults': function(/**yfiles.graph.IGraph*/ graph) {
        graph.nodeDefaults.style = new demo.LevelOfDetailNodeStyle(new yfiles.drawing.TemplateNodeStyle.WithKey("detailNodeStyleTemplate"), new yfiles.drawing.TemplateNodeStyle.WithKey("intermediateNodeStyleTemplate"), new yfiles.drawing.TemplateNodeStyle.WithKey("overviewNodeStyleTemplate"));
        graph.nodeDefaults.size = new yfiles.geometry.SizeD(285, 100);
        var newPolylineEdgeStyle = new yfiles.drawing.PolylineEdgeStyle();
        newPolylineEdgeStyle.pen = new yfiles.system.Pen.FromBrushAndThickness(new yfiles.system.SolidColorBrush(yfiles.system.Color.fromArgb(255, 170, 170, 170)), 2);
        newPolylineEdgeStyle.targetArrow = yfiles.drawing.DefaultArrow.NONE;
        graph.edgeDefaults.style = newPolylineEdgeStyle;

      },
      
      /** @type {yfiles.graph.IGraph} */
      'graph': {
        'get': function() {
          return this.graphControl.graph;
        }
      },
      
      'selectAndZoomToNode': function(/**yfiles.graph.INode*/ node) {
        this.graphControl.currentItem = node;
        this.zoomToCurrentItem();
        this.graphControl.focus();
      },
      
      /**
       * Returns the node representing the employee with the specified E-Mail address.
       * @return {yfiles.graph.INode}
       */
      'getNodeForEMail': function(/**string*/ email) {
        if (email === null) {
          return null;
        }

        return this.filteredGraphWrapper.fullGraph.nodes.getFirstElementOrDefaultWithPredicate(function(/**yfiles.graph.INode*/ node) {
          return node.tag !== null && email === ((/**@type {demo.Employee}*/(node.tag))).email;
        });
      },
      
      /**
       * Selects and zooms to the node representing the employee with the specified E-Mail address.
       */
      'selectAndZoomToNodeWithEmail': function(/**string*/ email) {
        var nodeForEMail = this.getNodeForEMail(email);
        if (null !== nodeForEMail) {
          this.selectAndZoomToNode(nodeForEMail);
        }
      },
      
      /**
       * Adds a "parent" reference to all subordinates contained in the source data.
       * The parent reference is needed to create the colleague and parent links 
       * in the properties view.
       * @param {Object} nodesSourceItem The source data in JSON format
       * @private
       */
      'addParentReferences': function(nodesSourceItem) {
        var subs = (/**@type {Object[]}*/(nodesSourceItem["subordinates"]));
        if (subs !== undefined) {
          var /**number*/ i;
          for (i = 0; i < subs.length; i++) {
            var sub = subs[i];
            sub["parent"] = nodesSourceItem;
            this.addParentReferences(sub);
          }
        }

      },
      
      /**
       * Create the graph using a TreeSource.
       * @param {Object} nodesSource The source data in JSON format
       */
      'createGraph': function(nodesSource) {
        this.addParentReferences(((/**@type {Object[]}*/(nodesSource)))[0]);

        var treeSource = new yfiles.binding.TreeSource();
        treeSource.childBinding = new yfiles.binding.Binding("subordinates");
        treeSource.nodesSource = nodesSource;


        this.registerElementDefaults(treeSource.graph);

        this.filteredGraphWrapper = new yfiles.graph.FilteredGraphWrapper(treeSource.buildGraph(), yfiles.lang.delegate(this.shouldShowNode, this), function(/**yfiles.graph.IEdge*/ e) {
          return true;
        });
        this.graphControl.graph = this.filteredGraphWrapper;

        this.doLayout();

        this.graphControl.fitGraphBounds();
        this.limitViewport();
      },
      
      /**
       * Setup a ViewportLimiter that makes sure that the explorable region
       * doesn't exceed the graph size.
       * @private
       */
      'limitViewport': function() {
        this.graphControl.updateContentRectWithMargins(new yfiles.geometry.InsetsD(100));
        var limiter = this.graphControl.viewportLimiter;
        limiter.honorBothDimensions = false;
        limiter.bounds = this.graphControl.contentRect;
      },
      
      /**
       * The predicate used for the FilterGraphWrapper.
       * @param {yfiles.graph.INode} obj 
       * @return {boolean} 
       * @private
       */
      'shouldShowNode': function(/**yfiles.graph.INode*/ obj) {
        return !this.hiddenNodesSet.contains(obj);
      },
      
      /**
       * Used by the predicate function to determine which nodes should not be shown.
       * @type {yfiles.collections.HashSet.<yfiles.graph.INode>}
       * @private
       */
      'hiddenNodesSet': null,
      
      /**
       * @type {yfiles.graph.FilteredGraphWrapper}
       * @private
       */
      'filteredGraphWrapper': null,
      
      /**
       * @type {boolean}
       * @private
       */
      'doingLayout': false,
      
      // #region Tree Layout Configuration and initial execution

      /**
       * Does a tree layout of the Graph provided by the <code>TreeDataBuilder</code>.
       * The layout and assistant attributes from the business data of the employees are used to
       * guide the the layout.
       */
      'doLayout': function() {
        var tree = this.graphControl.graph;

        this.configureLayout(tree);
        new yfiles.tree.GenericTreeLayouter().applyLayout(tree);
        this.cleanUp(tree);
      },
      
      /** @private */
      'configureLayout': function(/**yfiles.graph.IGraph*/ tree) {
        var registry = tree.mapperRegistry;

        var nodePlacerMapper = registry.addDictionaryMapper(yfiles.graph.INode.$class, yfiles.tree.INodePlacer.$class, yfiles.tree.GenericTreeLayouter.NODE_PLACER_DP_KEY);
        var assistantMapper = registry.addDictionaryMapper(yfiles.graph.INode.$class, yfiles.lang.Boolean.$class, yfiles.tree.AssistantPlacer.ASSISTANT_DP_KEY);

        tree.nodes.forEach((function(/**yfiles.graph.INode*/ node) {
          if (tree.inDegree(node) === 0) {
            this.setNodePlacers(node, nodePlacerMapper, assistantMapper, tree);
          }
        }).bind(this));
      },
      
      /** @private */
      'setNodePlacers': function(/**yfiles.graph.INode*/ rootNode, /**yfiles.model.IMapper.<yfiles.graph.INode, yfiles.tree.INodePlacer>*/ nodePlacerMapper, /**yfiles.model.IMapper.<yfiles.graph.INode, boolean>*/ assistantMapper, /**yfiles.graph.IGraph*/ tree) {
        var employee = (/**@type {demo.Employee}*/(rootNode.tag));
        if (employee !== null) {
          var layout = employee.layout;
          switch (layout) {
            case "rightHanging":
              var newDefaultNodePlacer = new yfiles.tree.DefaultNodePlacer.WithAlignmentAndDistance(yfiles.tree.ChildPlacement.VERTICAL_TO_RIGHT, yfiles.tree.RootAlignment.LEADING_ON_BUS, 30, 30);
              newDefaultNodePlacer.routingStyle = yfiles.tree.RoutingStyle.FORK_AT_ROOT;
              nodePlacerMapper.setItem(rootNode, newDefaultNodePlacer);
              break;
            case "leftHanging":
              var newDefaultNodePlacer1 = new yfiles.tree.DefaultNodePlacer.WithAlignmentAndDistance(yfiles.tree.ChildPlacement.VERTICAL_TO_LEFT, yfiles.tree.RootAlignment.LEADING_ON_BUS, 30, 30);
              newDefaultNodePlacer1.routingStyle = yfiles.tree.RoutingStyle.FORK_AT_ROOT;
              nodePlacerMapper.setItem(rootNode, newDefaultNodePlacer1);
              break;
            case "bothHanging":
              var newLeftRightPlacer = new yfiles.tree.LeftRightPlacer();
              newLeftRightPlacer.placeLastOnBottom = false;
              nodePlacerMapper.setItem(rootNode, newLeftRightPlacer);
              break;
            default:
              nodePlacerMapper.setItem(rootNode, new yfiles.tree.DefaultNodePlacer.WithAlignmentAndDistance(yfiles.tree.ChildPlacement.HORIZONTAL_DOWNWARD, yfiles.tree.RootAlignment.MEDIAN, 30, 30));
              break;
          }

          var assistant = employee.assistant;
          if (assistant && tree.inDegree(rootNode) > 0) {
            var inEdge = tree.inEdgesAt(rootNode).getItem(0);
            var parent = inEdge.getSourceNode();
            var oldParentPlacer = nodePlacerMapper.getItem(parent);
            var assistantPlacer = new yfiles.tree.AssistantPlacer();
            assistantPlacer.childNodePlacer = oldParentPlacer;
            nodePlacerMapper.setItem(parent, assistantPlacer);
            assistantMapper.setItem(rootNode, true);
          }
        }

        tree.outEdgesAt(rootNode).forEach((function(/**yfiles.graph.IEdge*/ outEdge) {
          var child = (/**@type {yfiles.graph.INode}*/(outEdge.targetPort.owner));
          this.setNodePlacers(child, nodePlacerMapper, assistantMapper, tree);
        }).bind(this));
      },
      
      /** @private */
      'cleanUp': function(/**yfiles.graph.IGraph*/ graph) {
        var registry = graph.mapperRegistry;
        registry.removeMapper(yfiles.tree.AssistantPlacer.ASSISTANT_DP_KEY);
        registry.removeMapper(yfiles.tree.GenericTreeLayouter.NODE_PLACER_DP_KEY);
      },
      
      // #endregion Tree Layout Configuration and initial execution

      // #region Command Binding Helper methods

      /**
       * Helper method that determines whether the {@link demo.OrgChartDemo#SHOW_PARENT_COMMAND} can be executed.
       */
      'canExecuteShowChildren': function(sender, /**yfiles.system.CanExecuteRoutedEventArgs*/ e) {
        var param = e.parameter;
        var item = param !== null ? param : this.graphControl.currentItem;
        if (yfiles.graph.INode.isInstance(item) && !this.doingLayout && this.filteredGraphWrapper !== null) {
          e.canExecute = this.filteredGraphWrapper.outDegree((/**@type {yfiles.graph.INode}*/(item))) !== this.filteredGraphWrapper.fullGraph.outDegree((/**@type {yfiles.graph.INode}*/(item)));
        } else {
          e.canExecute = false;
        }
        e.handled = true;
      },
      
      /**
       * Handler for the {@link demo.OrgChartDemo#SHOW_CHILDREN_COMMAND}.
       */
      'showChildrenExecuted': function(sender, /**yfiles.system.ExecutedRoutedEventArgs*/ e) {
        var param = e.parameter;
        var item = param !== null ? param : this.graphControl.currentItem;
        if (yfiles.graph.INode.isInstance(item) && !this.doingLayout) {
          var count = this.hiddenNodesSet.count;
          this.filteredGraphWrapper.fullGraph.outEdgesAt((/**@type {yfiles.graph.INode}*/(item))).forEach((function(/**yfiles.graph.IEdge*/ childEdge) {
            var child = childEdge.getTargetNode();
            if (this.hiddenNodesSet.remove(child)) {
              this.filteredGraphWrapper.fullGraph.setCenter(child, ((/**@type {yfiles.graph.INode}*/(item))).layout.getRectangleCenter());
              this.filteredGraphWrapper.fullGraph.clearBends(childEdge);
            }
          }).bind(this));
          this.refreshLayout(count, (/**@type {yfiles.graph.INode}*/(item)));
        }
      },
      
      /**
       * Helper method that determines whether the {@link demo.OrgChartDemo#SHOW_PARENT_COMMAND} can be executed.
       * @private
       */
      'canExecuteShowParent': function(sender, /**yfiles.system.CanExecuteRoutedEventArgs*/ e) {
        var param = e.parameter;
        var item = param !== null ? param : this.graphControl.currentItem;
        if (yfiles.graph.INode.isInstance(item) && !this.doingLayout && this.filteredGraphWrapper !== null) {
          e.canExecute = this.filteredGraphWrapper.inDegree((/**@type {yfiles.graph.INode}*/(item))) === 0 && this.filteredGraphWrapper.fullGraph.inDegree((/**@type {yfiles.graph.INode}*/(item))) > 0;
        } else {
          e.canExecute = false;
        }
        e.handled = true;
      },
      
      /**
       * Handler for the {@link demo.OrgChartDemo#SHOW_PARENT_COMMAND}.
       * @private
       */
      'showParentExecuted': function(sender, /**yfiles.system.ExecutedRoutedEventArgs*/ e) {
        var param = e.parameter;
        var item = param !== null ? param : this.graphControl.currentItem;
        if (yfiles.graph.INode.isInstance(item) && !this.doingLayout) {
          var count = this.hiddenNodesSet.count;
          this.filteredGraphWrapper.fullGraph.inEdgesAt((/**@type {yfiles.graph.INode}*/(item))).forEach((function(/**yfiles.graph.IEdge*/ parentEdge) {
            var parent = parentEdge.getSourceNode();
            if (this.hiddenNodesSet.remove(parent)) {
              this.filteredGraphWrapper.fullGraph.setCenter(parent, ((/**@type {yfiles.graph.INode}*/(item))).layout.getRectangleCenter());
              this.filteredGraphWrapper.fullGraph.clearBends(parentEdge);
            }
          }).bind(this));
          this.refreshLayout(count, (/**@type {yfiles.graph.INode}*/(item)));
        }
      },
      
      /**
       * Helper method that determines whether the {@link demo.OrgChartDemo#HIDE_PARENT_COMMAND} can be executed.
       * @private
       */
      'canExecuteHideParent': function(sender, /**yfiles.system.CanExecuteRoutedEventArgs*/ e) {
        var param = e.parameter;
        var item = param !== null ? param : this.graphControl.currentItem;
        if (yfiles.graph.INode.isInstance(item) && !this.doingLayout && this.filteredGraphWrapper !== null) {
          e.canExecute = this.filteredGraphWrapper.inDegree((/**@type {yfiles.graph.INode}*/(item))) > 0;
        } else {
          e.canExecute = false;
        }
        e.handled = true;
      },
      
      /**
       * Handler for the {@link demo.OrgChartDemo#HIDE_PARENT_COMMAND}.
       * @private
       */
      'hideParentExecuted': function(sender, /**yfiles.system.ExecutedRoutedEventArgs*/ e) {
        var param = e.parameter;
        var item = param !== null ? param : this.graphControl.currentItem;
        if (yfiles.graph.INode.isInstance(item) && !this.doingLayout) {
          var count = this.hiddenNodesSet.count;

          this.filteredGraphWrapper.fullGraph.nodes.forEach((function(/**yfiles.graph.INode*/ testNode) {
            if (testNode !== item && this.filteredGraphWrapper.contains(testNode) && this.filteredGraphWrapper.inDegree(testNode) === 0) {
              // this is a root node - remove it and all children unless 
              this.hideAllExcept(testNode, (/**@type {yfiles.graph.INode}*/(item)));
            }
          }).bind(this));
          this.refreshLayout(count, (/**@type {yfiles.graph.INode}*/(item)));
        }
      },
      
      /**
       * Helper method that determines whether the {@link demo.OrgChartDemo#HIDE_CHILDREN_COMMAND} can be executed.
       * @private
       */
      'canExecuteHideChildren': function(sender, /**yfiles.system.CanExecuteRoutedEventArgs*/ e) {
        var param = e.parameter;
        var item = param !== null ? param : this.graphControl.currentItem;
        if (yfiles.graph.INode.isInstance(item) && !this.doingLayout && this.filteredGraphWrapper !== null) {
          e.canExecute = this.filteredGraphWrapper.outDegree((/**@type {yfiles.graph.INode}*/(item))) > 0;
        } else {
          e.canExecute = false;
        }
        e.handled = true;
      },
      
      /**
       * Handler for the {@link demo.OrgChartDemo#HIDE_CHILDREN_COMMAND}.
       * @private
       */
      'hideChildrenExecuted': function(sender, /**yfiles.system.ExecutedRoutedEventArgs*/ e) {
        var param = e.parameter;
        var item = param !== null ? param : this.graphControl.currentItem;
        if (yfiles.graph.INode.isInstance(item) && !this.doingLayout) {
          var count = this.hiddenNodesSet.count;
          this.filteredGraphWrapper.outEdgesAt((/**@type {yfiles.graph.INode}*/(item))).forEach((function(/**yfiles.graph.IEdge*/ child) {
            this.hideAllExcept((/**@type {yfiles.graph.INode}*/(child.targetPort.owner)), (/**@type {yfiles.graph.INode}*/(item)));
          }).bind(this));
          this.refreshLayout(count, (/**@type {yfiles.graph.INode}*/(item)));
        }
      },
      
      /**
       * Helper method that determines whether the {@link demo.OrgChartDemo#SHOW_PARENT_COMMAND} can be executed.
       * @private
       */
      'canExecuteShowAll': function(sender, /**yfiles.system.CanExecuteRoutedEventArgs*/ e) {
        e.canExecute = this.filteredGraphWrapper !== null && this.hiddenNodesSet.count !== 0 && !this.doingLayout;
        e.handled = true;
      },
      
      /**
       * Handler for the {@link demo.OrgChartDemo#SHOW_ALL_COMMAND}.
       * @private
       */
      'showAllExecuted': function(sender, /**yfiles.system.ExecutedRoutedEventArgs*/ e) {
        if (!this.doingLayout) {
          this.hiddenNodesSet.clear();
          this.refreshLayout(-1, (/**@type {yfiles.graph.INode}*/(this.graphControl.currentItem)));
        }
      },
      
      /** @private */
      'refreshLayout': function(/**number*/ count, /**yfiles.graph.INode*/ centerNode) {
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
          var tree = this.graphControl.graph;

          // we mark a node as the center node
          this.graphControl.graph.mapperRegistry.addMapperWithTagAndGetter(yfiles.graph.INode.$class, yfiles.lang.Boolean.$class, yfiles.layout.FixNodeLayoutStage.FIXED_NODE_DP_KEY, function(/**yfiles.graph.INode*/ node) {
            return node === centerNode;
          });
          // configure the tree layout
          this.configureLayout(tree);

          // create the layouter (with a stage that fixes the center node in the coordinate system)
          var layouter = new yfiles.layout.FixNodeLayoutStage.WithCoreLayouter(new yfiles.tree.GenericTreeLayouter());

          // configure a LayoutExecutor
          var executor = new yfiles.graph.LayoutExecutor.FromControlAndLayouter(this.graphControl, layouter);
          executor.animateViewport = centerNode === null;
          executor.easedAnimation = true;
          executor.updateContentRect = true;
          executor.duration = yfiles.system.TimeSpan.fromMilliseconds(500);

          // add hook for cleanup
          executor.finishHandler = (function(sender, /**yfiles.system.EventArgs*/ args) {
            this.graphControl.graph.mapperRegistry.removeMapper(yfiles.layout.FixNodeLayoutStage.FIXED_NODE_DP_KEY);
            this.cleanUp(tree);
            this.doingLayout = false;
            this.limitViewport();
            if (args instanceof yfiles.graph.LayoutExceptionEventArgs) {
              var exception = ((/**@type {yfiles.graph.LayoutExceptionEventArgs}*/(args))).exception;
              demo.Application.handleError(exception, exception.message, 0);
            }
          }).bind(this);
          executor.start();
        }
      },
      
      // #endregion Command Binding Helper methods

      /**
       * Helper method that hides all nodes and its descendants except for a given node.
       * @private
       */
      'hideAllExcept': function(/**yfiles.graph.INode*/ nodeToHide, /**yfiles.graph.INode*/ exceptNode) {
        this.hiddenNodesSet.add(nodeToHide);
        this.filteredGraphWrapper.fullGraph.outEdgesAt(nodeToHide).forEach((function(/**yfiles.graph.IEdge*/ edge) {
          var child = (/**@type {yfiles.graph.INode}*/(edge.targetPort.owner));
          if (exceptNode !== child) {
            this.hideAllExcept(child, exceptNode);
          }
        }).bind(this));
      },
      
      /** @private */
      'zoomToCurrentItem': function() {
        var currentItem = this.graphControl.currentItem;

        if (yfiles.graph.INode.isInstance(currentItem)) {
          // visible current item
          if (this.graphControl.graph.contains(currentItem)) {
            yfiles.canvas.GraphControl.ZOOM_TO_CURRENT_ITEM_COMMAND.executeOnTarget(null, this.graphControl);
          } else {
            // see if it can be made visible
            if (this.filteredGraphWrapper.fullGraph.nodes.contains((/**@type {yfiles.graph.INode}*/(currentItem)))) {
              // uhide all nodes...
              this.hiddenNodesSet.clear();
              // except the node to be displayed and all its descendants
              this.filteredGraphWrapper.fullGraph.nodes.forEach((function(/**yfiles.graph.INode*/ testNode) {
                if (testNode !== currentItem && this.filteredGraphWrapper.fullGraph.inDegree(testNode) === 0) {
                  this.hideAllExcept(testNode, (/**@type {yfiles.graph.INode}*/(currentItem)));
                }
              }).bind(this));
              // reset the layout to make the animation nicer
              this.filteredGraphWrapper.nodes.forEach((function(/**yfiles.graph.INode*/ n) {
                this.filteredGraphWrapper.setCenter(n, yfiles.geometry.PointD.ORIGIN);
              }).bind(this));
              this.filteredGraphWrapper.edges.forEach((function(/**yfiles.graph.IEdge*/ edge) {
                this.filteredGraphWrapper.clearBends(edge);
              }).bind(this));
              this.refreshLayout(-1, null);
            }
          }
        }
      },
      
      /**
       * Prints the graph, separated in tiles.
       */
      'print': function() {
        var printingSupport = new demo.OrgChartPrintingSupport();
        printingSupport.tiledPrinting = true;
        printingSupport.scale = 0.29;
        printingSupport.margin = 1;
        printingSupport.tileWidth = 842;
        printingSupport.tileHeight = 595;
        printingSupport.print(this.graphControl, null);
      },
      
      /** @lends {demo.OrgChartDemo} */
      '$static': {
        /**
         * The command that can be used to show the parent node.
         * This command requires the corresponding {@link yfiles.graph.INode} as the {@link yfiles.system.ExecutedRoutedEventArgs#parameter}.
         * @type {yfiles.system.RoutedUICommand}
         */
        'SHOW_PARENT_COMMAND': null,
        
        /**
         * The command that can be used to hide the parent node.
         * This command requires the corresponding {@link yfiles.graph.INode} as the {@link yfiles.system.ExecutedRoutedEventArgs#parameter}.
         * @type {yfiles.system.RoutedUICommand}
         */
        'HIDE_PARENT_COMMAND': null,
        
        /**
         * The command that can be used to show the child nodes.
         * This command requires the corresponding {@link yfiles.graph.INode} as the {@link yfiles.system.ExecutedRoutedEventArgs#parameter}.
         * @type {yfiles.system.RoutedUICommand}
         */
        'SHOW_CHILDREN_COMMAND': null,
        
        /**
         * The command that can be used to hide the child nodes.
         * This command requires the corresponding {@link yfiles.graph.INode} as the {@link yfiles.system.ExecutedRoutedEventArgs#parameter}.
         * @type {yfiles.system.RoutedUICommand}
         */
        'HIDE_CHILDREN_COMMAND': null,
        
        /**
         * The command that can be used to expand all collapsed nodes.
         * @type {yfiles.system.RoutedUICommand}
         */
        'SHOW_ALL_COMMAND': null,
        
        /** @return {yfiles.graph.INode} */
        'getRootNode': function(/**yfiles.graph.IGraph*/ graph) {
          return graph.nodes.getFirstElementOrDefaultWithPredicate(function(/**yfiles.graph.INode*/ node) {
            return graph.inDegree(node) === 0;
          });
        },
        
        '$clinit': function() {
          demo.OrgChartDemo.SHOW_PARENT_COMMAND = new yfiles.system.RoutedUICommand.FromNameTypeAndInputGestures("Show Parent", "ShowParent", demo.OrgChartDemo.$class);
          demo.OrgChartDemo.HIDE_PARENT_COMMAND = new yfiles.system.RoutedUICommand.FromNameTypeAndInputGestures("Hide Parent", "HideParent", demo.OrgChartDemo.$class);
          demo.OrgChartDemo.SHOW_CHILDREN_COMMAND = new yfiles.system.RoutedUICommand.FromNameTypeAndInputGestures("Show Children", "ShowChildren", demo.OrgChartDemo.$class);
          demo.OrgChartDemo.HIDE_CHILDREN_COMMAND = new yfiles.system.RoutedUICommand.FromNameTypeAndInputGestures("Hide Children", "HideChildren", demo.OrgChartDemo.$class);
          demo.OrgChartDemo.SHOW_ALL_COMMAND = new yfiles.system.RoutedUICommand.FromNameTypeAndInputGestures("Show All", "ShowAll", demo.OrgChartDemo.$class);
        }
        
      }
    };
  })


});
return yfiles.module('demo');
}));})("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this);
