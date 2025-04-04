export default {
  "typesRemoved": {
    "Future": null,
    "StorageLocation": null,
    "MouseWheelDeltaMode": null
  },
  "typesNew": [
    "KShortestPaths",
    "KShortestPathsResult",
    "QueryToolTipEventArgs",
    "CompositeEdgeStyle",
    "CompositeEdgeStyleExtension",
    "CompositeLabelStyle",
    "CompositeLabelStyleExtension",
    "CompositeNodeStyle",
    "CompositeNodeStyleExtension",
    "CompositePortStyle",
    "CompositePortStyleExtension",
    "DelegatingEdgeStyle",
    "DelegatingLabelStyle",
    "DelegatingNodeStyle",
    "DelegatingPortStyle",
    "ShapePortStyle"
  ],
  "membersRenamed": {
    "ResultItemCollection": {
      "ofType": "ofType(number)"
    },
    "ResultItemMapping": {
      "ofType": "ofType(number)"
    },
    "HashMap": {
      "ofType": "ofType(number)"
    },
    "ICollection": {
      "ofType": "ofType(number)"
    },
    "IEnumerable": {
      "ofType": "ofType(number)"
    },
    "ILinkedItemEnumerable": {
      "ofType": "ofType(number)"
    },
    "IList": {
      "ofType": "ofType(number)"
    },
    "IListEnumerable": {
      "ofType": "ofType(number)"
    },
    "IMap": {
      "ofType": "ofType(number)"
    },
    "IObservableCollection": {
      "ofType": "ofType(number)"
    },
    "List": {
      "ofType": "ofType(number)"
    },
    "ListEnumerable": {
      "ofType": "ofType(number)"
    },
    "ObservableCollection": {
      "ofType": "ofType(number)"
    },
    "YList": {
      "ofType": "ofType(number)"
    },
    "GeneralPath": {
      "getBounds": "getBounds",
      "getBounds(number)": "getBounds",
      "intersects(GeneralPath,number)": "pathIntersects(GeneralPath,number)",
      "intersects(Rect,number)": "pathIntersects(IRectangle,number)",
      "isEmpty": "isVisible",
      "mayIntersectClip": "pathMayIntersectClip"
    },
    "BendAnchoredPortLocationModel": {
      "createFromSource": "createParameterFromSource",
      "createFromTarget": "createParameterFromTarget"
    },
    "FilteredGraphWrapper": {
      "groupNodes(IEnumerable)": "groupNodes(IEnumerable,INodeStyle,any)"
    },
    "Graph": {
      "groupNodes(IEnumerable)": "groupNodes(IEnumerable,INodeStyle,any)"
    },
    "GraphCopier": {
      "copy": "copy(IGraph,IGraph,IEnumerable,INode,Point,UNRESOLVED.ItemCopiedCallback)"
    },
    "GraphWrapperBase": {
      "groupNodes(IEnumerable)": "groupNodes(IEnumerable,INodeStyle,any)"
    },
    "IColumn": {
      "globalPadding": "totalPadding"
    },
    "IGraph": {
      "groupNodes(IEnumerable)": "groupNodes(IEnumerable,INodeStyle,any)"
    },
    "IRow": {
      "globalPadding": "totalPadding"
    },
    "IStripe": {
      "globalPadding": "totalPadding"
    },
    "SegmentRatioPortLocationModel": {
      "createFromSource": "createParameterFromSource",
      "createFromTarget": "createParameterFromTarget"
    },
    "StretchStripeLabelModel": {
      "useGlobalPadding": "useTotalPadding"
    },
    "StripeLabelModel": {
      "useGlobalPadding": "useTotalPadding"
    },
    "GraphMLIOHandler": {
      "addInputMapperFuture(Constructor,Constructor,string)": "addInputMapper(Constructor,Constructor,string,IMapper)",
      "addInputMapperFuture(Constructor,Constructor,UNRESOLVED.Predicate,UNRESOLVED.Func4)": "addInputMapper(Constructor,Constructor,string,IMapper)"
    },
    "HierarchicalLayoutNodeContext": {
      "groupId": "edgeGroupId"
    },
    "CreateEdgeInputMode": {
      "createEdgeCreationInputModeContext": "createInputModeContext"
    },
    "EditLabelInputMode": {
      "startLabelCreation": "startLabelAddition"
    },
    "LabelPositionHandler": {
      "useParameterFinder": "shouldUseParameterFinder"
    },
    "PortRelocationHandle": {
      "createPreviewEdgeVisualCreator": "createPreviewEdge"
    },
    "TextEditorInputMode": {
      "textBoxPadding": "textBoxMargins"
    },
    "OrthogonalLayoutMode": {
      "BOX": "FORCED_STRAIGHT_LINE",
      "DEFAULT": "STRICT",
      "MIXED": "RELAXED"
    },
    "SubtreeTransform": {
      "ROTATE180": "ROTATE_180"
    },
    "CanvasComponent": {
      "toPageFromView": "viewToPageCoordinates",
      "toViewFromPage": "pageToViewCoordinates",
      "toWorldFromPage": "pageToWorldCoordinates"
    },
    "FocusIndicatorManager": {
      "onPropertyChanged": "onFocusedItemChanged"
    },
    "GraphComponent": {
      "toPageFromView": "viewToPageCoordinates",
      "toViewFromPage": "pageToViewCoordinates",
      "toWorldFromPage": "pageToWorldCoordinates"
    },
    "GraphOverviewComponent": {
      "toPageFromView": "viewToPageCoordinates",
      "toViewFromPage": "pageToViewCoordinates",
      "toWorldFromPage": "pageToWorldCoordinates"
    },
    "IGraphSelection": {
      "ofType": "ofType(number)"
    },
    "IRenderTreeGroup": {
      "ofType": "ofType(number)"
    },
    "IStripeSelection": {
      "ofType": "ofType(number)"
    },
    "PointerEventType": {
      "LOST_CAPTURE": "DRAG_CAPTURE_LOST"
    },
    "StripeSelection": {
      "ofType": "ofType(number)"
    },
    "TextWrapping": {
      "CHARACTER": "WRAP_CHARACTER",
      "CHARACTER_ELLIPSIS": "WRAP_CHARACTER_ELLIPSIS",
      "WORD": "WRAP_WORD",
      "WORD_ELLIPSIS": "WRAP_WORD_ELLIPSIS"
    },
    "ViewportLimitingMode": {
      "CONTROL_RESIZED": "COMPONENT_RESIZED"
    },
    "WebGLFocusIndicatorManager": {
      "onPropertyChanged": "onFocusedItemChanged"
    }
  },
  "membersRemoved": {
    "Point": {
      "moveBy": null
    },
    "GraphMLIOHandler": {
      "addInputHandlerFactory": null,
      "addInputMapperFuture": null
    },
    "Command": {
      "MOVE_FOCUS_PAGE_DOWN": null,
      "MOVE_FOCUS_PAGE_UP": null,
      "MOVE_TO_PAGE_DOWN": null,
      "MOVE_TO_PAGE_UP": null,
      "SELECT_TO_PAGE_DOWN": null,
      "SELECT_TO_PAGE_UP": null
    },
    "LabelPositionHandler": {
      "setPosition": null,
      "useFinder": null
    },
    "LayoutKeys": {
      "AFFECTED_EDGE_LABELS_DATA_KEY": null,
      "AFFECTED_EDGES_DATA_KEY": null,
      "AFFECTED_NODE_LABELS_DATA_KEY": null,
      "AFFECTED_NODES_DATA_KEY": null
    },
    "OrthogonalLayoutMode": {
      "FIXED_BOX": null,
      "FIXED_MIXED": null,
      "UNIFORM": null
    },
    "Color": {
      "CURRENT_COLOR": null
    },
    "CssFill": {
      "CURRENT_COLOR": null
    },
    "Fill": {
      "CURRENT_COLOR": null
    },
    "LinearGradient": {
      "CURRENT_COLOR": null
    },
    "PatternFill": {
      "CURRENT_COLOR": null
    },
    "PointerEventArgs": {
      "deltaMode": null
    },
    "RadialGradient": {
      "CURRENT_COLOR": null
    },
    "RenderTree": {
      "VOID_OBJECT_RENDERER": null,
      "VOID_VISUAL_CREATOR": null
    }
  },
  "membersNew": {
    "ResultItemCollection": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "ResultItemMapping": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "HashMap": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "ICollection": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "IEnumerable": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "ILinkedItemEnumerable": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "IList": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "IListEnumerable": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "IMap": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "IObservableCollection": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "List": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)",
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "ListEnumerable": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "ObservableCollection": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "YList": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)",
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "GeneralPath": [
      "areaOrPathContains",
      "getApproximateBounds"
    ],
    "Rect": [
      "distanceTo(Point)",
      "distanceTo(Rect)"
    ],
    "GraphCopier": [
      "copy(IGraph,IGraph,UNRESOLVED.Predicate,INode,Point,UNRESOLVED.ItemCopiedCallback)"
    ],
    "Command": [
      "EXTEND_SELECTION_HIERARCHY_DOWN",
      "EXTEND_SELECTION_HIERARCHY_UP",
      "MOVE_FOCUS_HIERARCHY_DOWN",
      "MOVE_FOCUS_HIERARCHY_UP",
      "MOVE_HIERARCHY_DOWN",
      "MOVE_HIERARCHY_UP"
    ],
    "EditLabelHelper": [
      "onLabelPasting"
    ],
    "GraphEditorInputMode": [
      "allowEditLabelOnTyping"
    ],
    "HandlesRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IStripeInputRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IStripeLabelInputRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "KeyboardInputMode": [
      "onTextInput",
      "text"
    ],
    "LabelEditingAction": [
      "PASTE"
    ],
    "LabelPositionHandler": [
      "preventConflictingMixedMoves",
      "shouldIgnoreMoves",
      "useParameterFinderRecognizer"
    ],
    "NavigationInputMode": [
      "getReferenceLocation"
    ],
    "TextEditorInputMode": [
      "initializeSelection",
      "selectContents"
    ],
    "ToolTipEventArgs": [
      "toolTipAsync"
    ],
    "TabularLayout": [
      "createLayoutData(IGraph)",
      "createLayoutData(LayoutGraph)"
    ],
    "TreeMapLayout": [
      "createLayoutData(IGraph)",
      "createLayoutData(LayoutGraph)"
    ],
    "Color": [
      "CURRENT_COLOR"
    ],
    "UNRESOLVED.EdgeStyleIndicatorRenderer": [
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER"
    ],
    "GraphOverviewRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "GridRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IFocusRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IGraphSelection": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "IHighlightRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IObjectRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IRenderTreeGroup": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "ISelectionRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IStripeSelection": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "IVisualCreator": [
      "VOID_VISUAL_CREATOR"
    ],
    "UNRESOLVED.LabelStyleIndicatorRenderer": [
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER"
    ],
    "UNRESOLVED.NodeStyleIndicatorRenderer": [
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER"
    ],
    "ObjectRendererBase": [
      "VOID_OBJECT_RENDERER"
    ],
    "PointerButtons": [
      "TOUCH_CONTACT"
    ],
    "PointerEventType": [
      "DRAG_CAPTURE_LOST"
    ],
    "PortCandidateRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "UNRESOLVED.PortStyleIndicatorRenderer": [
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER"
    ],
    "StripeSelection": [
      "ofType(boolean)",
      "ofType(Constructor)",
      "ofType(string)"
    ],
    "WebGLNodeIndicatorShape": [
      "DIAMOND",
      "TRIANGLE_POINTING_DOWN",
      "TRIANGLE_POINTING_LEFT",
      "TRIANGLE_POINTING_RIGHT"
    ],
    "WebGLShapeNodeShape": [
      "DIAMOND",
      "TRIANGLE_POINTING_DOWN",
      "TRIANGLE_POINTING_LEFT",
      "TRIANGLE_POINTING_RIGHT"
    ]
  },
  "signaturesChanged": {
    "GeneralPath": {
      "getProjection": [
        -1,
        1
      ]
    },
    "SegmentRatioPortLocationModel": {
      "createFromSource": [
        1,
        0
      ],
      "createFromTarget": [
        1,
        0
      ]
    },
    "NavigationInputMode": {
      "findNearestItem": [
        0,
        -1,
        2,
        3
      ]
    }
  },
  "returnTypesChanged": {
    "GraphMLIOHandler": {
      "addInputMapperFuture(Constructor,Constructor,string)": "",
      "addInputMapperFuture(Constructor,Constructor,UNRESOLVED.Predicate,UNRESOLVED.Func4)": ""
    },
    "CreateEdgeInputMode": {
      "createEdge": "Promise<IEdge | null> | IEdge"
    },
    "GraphEditorInputMode": {
      "createNode": "Promise<INode | null> | INode"
    },
    "PortRelocationHandle": {
      "createPreviewEdgeVisualCreator": "SimpleEdge"
    },
    "AspectRatioSubtreePlacer": {
      "createFromSketchComparator": "function(yfiles.layout.LayoutEdge, yfiles.layout.LayoutEdge):number"
    },
    "AssistantSubtreePlacer": {
      "createFromSketchComparator": "function(yfiles.layout.LayoutEdge, yfiles.layout.LayoutEdge):number"
    },
    "DendrogramSubtreePlacer": {
      "createFromSketchComparator": "function(yfiles.layout.LayoutEdge, yfiles.layout.LayoutEdge):number"
    },
    "DoubleLayerSubtreePlacer": {
      "createFromSketchComparator": "function(yfiles.layout.LayoutEdge, yfiles.layout.LayoutEdge):number"
    },
    "FixedSubtreePlacer": {
      "createFromSketchComparator": "function(yfiles.layout.LayoutEdge, yfiles.layout.LayoutEdge):number"
    },
    "IFromSketchSubtreePlacer": {
      "createFromSketchComparator": "function(yfiles.layout.LayoutEdge, yfiles.layout.LayoutEdge):number"
    },
    "LeftRightSubtreePlacer": {
      "createFromSketchComparator": "function(yfiles.layout.LayoutEdge, yfiles.layout.LayoutEdge):number"
    },
    "LevelAlignedSubtreePlacer": {
      "createFromSketchComparator": "function(yfiles.layout.LayoutEdge, yfiles.layout.LayoutEdge):number"
    },
    "MultiLayerSubtreePlacer": {
      "createFromSketchComparator": "function(yfiles.layout.LayoutEdge, yfiles.layout.LayoutEdge):number"
    },
    "SingleLayerSubtreePlacer": {
      "createFromSketchComparator": "function(yfiles.layout.LayoutEdge, yfiles.layout.LayoutEdge):number"
    },
    "WebGLGraphModelManager": {
      "getStyle(IEdge)": "WebGLPolylineEdgeStyle | WebGLArcEdgeStyle | WebGLBridgeEdgeStyle",
      "getStyle(ILabel)": "WebGLLabelStyle | WebGLIconLabelStyle",
      "getStyle(INode)": "WebGLShapeNodeStyle | WebGLImageNodeStyle | WebGLGroupNodeStyle",
      "getWebGLEdgeStyle": "WebGLPolylineEdgeStyle | WebGLArcEdgeStyle | WebGLBridgeEdgeStyle | null",
      "getWebGLLabelStyle": "WebGLLabelStyle | WebGLIconLabelStyle",
      "getWebGLNodeStyle": "WebGLShapeNodeStyle | WebGLImageNodeStyle | WebGLGroupNodeStyle | null"
    }
  },
  "propertyTypesChanged": {
    "CircularLayoutData": {
      "nodeComparator": "function(TNode, TNode):number"
    },
    "GivenSequenceSequencer": {
      "sequenceComparator": "function(yfiles.layout.LayoutNode, yfiles.layout.LayoutNode):number"
    },
    "MultiComponentLayerAssigner": {
      "componentComparator": "function(yfiles.collections.YList<yfiles.layout.LayoutNode>, yfiles.collections.YList<yfiles.layout.LayoutNode>):number"
    },
    "LabelTextValidatingEventArgs": {
      "validatedText": "Promise<string | null> | string"
    },
    "LayoutExecutor": {
      "edgeComparator": "function(yfiles.graph.IEdge, yfiles.graph.IEdge):number",
      "nodeComparator": "function(yfiles.graph.INode, yfiles.graph.INode):number"
    },
    "LayoutExecutorAsync": {
      "edgeComparator": "function(yfiles.graph.IEdge, yfiles.graph.IEdge):number",
      "nodeComparator": "function(yfiles.graph.INode, yfiles.graph.INode):number"
    },
    "LayoutGraphAdapter": {
      "edgeComparator": "function(yfiles.graph.IEdge, yfiles.graph.IEdge):number",
      "nodeComparator": "function(yfiles.graph.INode, yfiles.graph.INode):number"
    },
    "RadialGroupLayoutData": {
      "childNodeComparator": "function(TNode, TNode):number"
    },
    "TabularLayoutData": {
      "freeNodeComparator": "function(TNode, TNode):number"
    },
    "EdgeRouterData": {
      "edgeProcessingComparator": "function(TEdge, TEdge):number"
    },
    "TreeMapLayoutData": {
      "childNodeComparator": "function(TNode, TNode):number"
    },
    "CollectionModelManager": {
      "comparator": "function(T, T):number"
    },
    "DragSource": {
      "source": "HTMLElement | SVGElement"
    },
    "Font": {
      "fontWeight": "'normal' | 'bold' | 'light' | 'bolder' | 'lighter' | 'inherit' | string"
    },
    "GraphModelManager": {
      "renderOrderComparator": "function(yfiles.graph.IModelItem, yfiles.graph.IModelItem):number"
    },
    "ItemModelManager": {
      "comparator": "function(T, T):number"
    },
    "PointerEventArgs": {
      "originalEvent": "PointerEvent | WheelEvent"
    },
    "RenderTree": {
      "renderOrderComparator": "function(yfiles.view.IRenderTreeElement, yfiles.view.IRenderTreeElement):number"
    },
    "WebGLEdgeStyleDecorator": {
      "webGLStyle": "WebGLPolylineEdgeStyle | WebGLArcEdgeStyle | WebGLBridgeEdgeStyle"
    },
    "WebGLFocusIndicatorManager": {
      "nodeStyle": "WebGLNodeIndicatorStyle | WebGLBeaconNodeIndicatorStyle"
    },
    "WebGLGraphModelManager": {
      "renderOrderComparator": "function(yfiles.graph.IModelItem, yfiles.graph.IModelItem):number"
    },
    "WebGLHighlightIndicatorManager": {
      "nodeStyle": "WebGLNodeIndicatorStyle | WebGLBeaconNodeIndicatorStyle"
    },
    "WebGLIconLabelStyle": {
      "padding": "Insets"
    },
    "WebGLLabelStyle": {
      "padding": "Insets"
    },
    "WebGLLabelStyleDecorator": {
      "webGLStyle": "WebGLLabelStyle | WebGLIconLabelStyle"
    },
    "WebGLNodeStyleDecorator": {
      "webGLStyle": "WebGLShapeNodeStyle | WebGLImageNodeStyle | WebGLGroupNodeStyle"
    },
    "WebGLSelectionIndicatorManager": {
      "nodeStyle": "WebGLNodeIndicatorStyle | WebGLBeaconNodeIndicatorStyle"
    }
  },
  "methodsProperties": {},
  "compatMethods": {},
  "typesRenamed": {
    "EdgeDecorationBendsRenderTag": "EdgeIndicatorBendsRenderTag",
    "EdgeStyleDecorationRenderer": "EdgeStyleIndicatorRenderer",
    "ItemToolTipEventArgs": "QueryItemToolTipEventArgs",
    "LabelStyleDecorationRenderer": "LabelStyleIndicatorRenderer",
    "NodeStyleDecorationRenderer": "NodeStyleIndicatorRenderer",
    "PortStyleDecorationRenderer": "PortStyleIndicatorRenderer",
    "SegmentRatioPortLocationModel": "EdgeSegmentPortLocationModel",
    "SegmentRatioPortLocationModelParameter": "EdgeSegmentPortLocationModelParameter",
    "StyleDecorationZoomPolicy": "StyleIndicatorZoomPolicy",
    "ToolTipEventArgs": "QueryToolTipEventArgs"
  },
  "moduleChanges": {},
  "constructorMappings": {}
}

