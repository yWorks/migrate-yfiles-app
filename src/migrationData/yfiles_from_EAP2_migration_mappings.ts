export default {
  "typesRemoved": {
    "Future": null
  },
  "typesNew": [
    "KShortestPaths",
    "KShortestPathsResult"
  ],
  "membersRenamed": {
    "GraphMLIOHandler": {
      "addInputMapperFuture(Constructor,Constructor,string)": "addInputMapper(Constructor,Constructor,string,IMapper)",
      "addInputMapperFuture(Constructor,Constructor,UNRESOLVED.Predicate,UNRESOLVED.Func4)": "addInputMapper(Constructor,Constructor,string,IMapper)"
    },
    "HierarchicalLayoutNodeContext": {
      "groupId": "edgeGroupId"
    },
    "PortRelocationHandle": {
      "createPreviewEdgeVisualCreator": "createPreviewEdge"
    },
    "TextEditorInputMode": {
      "selectContents": "selectContent",
      "textBoxPadding": "textBoxMargins"
    },
    "OrthogonalLayoutMode": {
      "BOX": "FORCED_STRAIGHT_LINE",
      "DEFAULT": "STRICT",
      "MIXED": "RELAXED"
    },
    "ShapePortStyle": {
      "brush": "fill",
      "pen": "stroke"
    },
    "SubtreeTransform": {
      "ROTATE180": "ROTATE_180"
    },
    "FocusIndicatorManager": {
      "onPropertyChanged": "onFocusedItemChanged"
    },
    "ViewportLimitingMode": {
      "CONTROL_RESIZED": "COMPONENT_RESIZED"
    },
    "WebGLFocusIndicatorManager": {
      "onPropertyChanged": "onFocusedItemChanged"
    }
  },
  "membersRemoved": {
    "GraphMLIOHandler": {
      "addInputHandlerFactory": null,
      "addInputMapperFuture": null
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
    "RenderTree": {
      "VOID_OBJECT_RENDERER": null,
      "VOID_VISUAL_CREATOR": null
    }
  },
  "membersNew": {
    "HandlesRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IStripeInputRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IStripeLabelInputRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "EdgeStyleIndicatorRenderer": [
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
    "IHighlightRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IObjectRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "ISelectionRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "IVisualCreator": [
      "VOID_VISUAL_CREATOR"
    ],
    "LabelStyleIndicatorRenderer": [
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER"
    ],
    "NodeStyleIndicatorRenderer": [
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER"
    ],
    "ObjectRendererBase": [
      "VOID_OBJECT_RENDERER"
    ],
    "PortCandidateRenderer": [
      "VOID_OBJECT_RENDERER"
    ],
    "PortStyleIndicatorRenderer": [
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER",
      "VOID_OBJECT_RENDERER"
    ]
  },
  "signaturesChanged": {},
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
  "typesRenamed": {},
  "moduleChanges": {},
  "constructorMappings": {}
}
