export default {
  "typesRemoved": {
    "IGridConstraintProvider": "Superseded by interfaces for the specific graph item types",
    "ILabelGridConstraintProvider": "Removed since it had no effect",
    "ILabelOwnerGridConstraintProvider": "Removed since it had no effect",
    "LassoPathFinishRegionRenderTag": "Superseded by the LassoRenderTag type",
    "EdgeIndicatorBendsRenderTag": "Replaced with instances of type IEnumerable<IBend>",
    "StripeSelection": "Use the instance provided by the TableEditorInputMode.stripeSelection property",
    "ZoomPolicy": "Removed since only the VIEW_COORDINATES value was ever used"
  },
  "typesNew": [
    "LassoRenderTag",
    "PopoverBehavior",
    "PopoverDescriptor",
    "PopoverManager",
    "PopoverUpdateReason",
    "UpdatePopoverEventArgs",
    "BundledEdgeRouterStrategy",
    "HeatMapRenderer",
    "PreventViewportInteractionPolicy",
    "WebGLBeaconEdgeIndicatorStyle",
    "WebGLPortStyleDecorator",
    "WebGLShapePortStyle",
    "WebGLZoomScalingPolicy",
    "WebGLZoomVisibilityPolicy"
  ],
  "membersRenamed": {
    "Table": {
      "remove": "remove(ILabel)",
      "setStyle": "setStyle(ILabel,ILabelStyle)"
    },
    "IncrementalEdgeHint": {
      "NONE": "KEEP_RELATIVE_ORDER",
      "SEQUENCE_INCREMENTALLY": "INCREMENTAL"
    },
    "IncrementalNodeHint": {
      "LAYER_INCREMENTALLY": "INCREMENTAL",
      "NONE": "KEEP_RELATIVE_ORDER",
      "SEQUENCE_INCREMENTALLY": "INCREMENTAL_WITH_LAYERS_FROM_SKETCH",
      "USE_EXACT_COORDINATES": "EXACT_COORDINATES"
    },
    "ToolTipInputMode": {
      "hide": "close",
      "show": "open"
    },
    "DiscreteEdgeLabelPositions": {
      "CENTERED": "CENTER"
    },
    "Interval": {
      "calculateUnion(Interval,number)": "calculateUnion(Interval,number)",
      "calculateUnion(Interval,Interval)": "calculateUnion(Interval,Interval)",
      "distanceTo(Interval)": "distanceTo(Interval)"
    },
    "Animator": {
      "animate(UNRESOLVED.AnimationCallback,TimeSpan)": "animate(UNRESOLVED.AnimationCallback,TimeSpan,AbortSignal)",
      "animate(IAnimation)": "animate(IAnimation,AbortSignal)"
    },
    "CanvasComponent": {
      "lastInputEvent": "lastPointerEvent"
    },
    "GraphComponent": {
      "lastInputEvent": "lastPointerEvent"
    },
    "GraphOverviewComponent": {
      "lastInputEvent": "lastPointerEvent"
    },
    "RadialGradient": {
      "radiusX": "radius",
      "radiusY": "radius"
    },
    "WebGLGraphModelManager": {
      "setAnimations(IEdge,UNRESOLVED.WebGLAnimation[])": "setAnimations",
      "setAnimations(ILabel,UNRESOLVED.WebGLAnimation[])": "setAnimations",
      "setAnimations(INode,UNRESOLVED.WebGLAnimation[])": "setAnimations",
      "updateStyle(IEdge)": "updateStyle",
      "updateStyle(ILabel)": "updateStyle",
      "updateStyle(INode)": "updateStyle"
    }
  },
  "membersRemoved": {
    "LayoutGraphAlgorithms": {
      "layerAssignment": "Use the static method HierarchicalLayoutCore.layerAssignment instead"
    },
    "MutablePoint": {
      "convertFrom": "Use the constructor instead.",
      "convertToPointD": "Use the toPoint method instead."
    },
    "MutableRectangle": {
      "convertFrom": "Use the constructor instead.",
      "convertToRectD": "Use the toRect method instead."
    },
    "MutableSize": {
      "convertFrom": "Use the constructor instead.",
      "convertToSizeD": "Use the toSize method instead."
    },
    "CoordinateAssigner": {
      "bendReduction": null,
      "exactPlacement": null,
      "fromSketchLayerAssignment": null,
      "straightenEdges": null
    },
    "IncrementalNodeHint": {
      "from": null,
      "getName": null,
      "USE_EXACT_LAYER_COORDINATES": "Use the static method IncrementalNodeHint.createExactCoordinatesHint instead",
      "USE_EXACT_SEQUENCE_COORDINATES": "Use the static method IncrementalNodeHint.createExactCoordinatesHint instead"
    },
    "ContextMenuInputMode": {
      "contextMenuParentElement": null
    },
    "LassoSelectionInputMode": {
      "finishRegionRenderer": null
    },
    "ToolTipInputMode": {
      "adjustTooltipPosition": "Use the properties of PopoverDescriptor instead.",
      "closeOnClick": null,
      "createToolTip": null,
      "getToolTipContent": "Use the PopoverDescriptor.content property instead.",
      "getToolTipLocation": null,
      "onShow": null,
      "toolTipParentElement": "Use the PopoverDescriptor.parentElement property instead",
      "updateLocation": null
    },
    "Workarounds": {
      "touchstartPreventDefault": "This workaround is obsolete, remove it."
    },
    "CanvasComponent": {
      "lastEventLocation": "Use the new property lastPointerEvent.location instead."
    },
    "GraphComponent": {
      "lastEventLocation": null
    },
    "GraphOverviewComponent": {
      "lastEventLocation": null
    },
    "IRenderTreeElement": {
      "dirty": null
    },
    "IRenderTreeGroup": {
      "dirty": null
    },
    "MouseWheelBehaviors": {
      "ONLY_WHEN_FOCUSED": "Use the new property CanvasComponent.preventViewportInteraction instead"
    }
  },
  "membersNew": {
    "LayoutGraphAlgorithms": [
      "greedySpanner"
    ],
    "NeighborhoodResult": [
      "edges"
    ],
    "ResultItemCollection": [
      "toSpliced",
      "with"
    ],
    "ResultItemMapping": [
      "toSpliced",
      "with"
    ],
    "AdjacencyGraphBuilder": [
      "addEventListener",
      "removeEventListener"
    ],
    "EdgeCreator": [
      "addEventListener",
      "removeEventListener"
    ],
    "GraphBuilder": [
      "addEventListener",
      "removeEventListener"
    ],
    "LabelCreator": [
      "addEventListener",
      "removeEventListener"
    ],
    "NodeCreator": [
      "addEventListener",
      "removeEventListener"
    ],
    "TreeBuilder": [
      "addEventListener",
      "removeEventListener"
    ],
    "CircularLayout": [
      "createLayoutData",
      "ensure"
    ],
    "CompactDiskLayout": [
      "createLayoutData"
    ],
    "HashMap": [
      "toSpliced",
      "with"
    ],
    "ICollection": [
      "toSpliced",
      "with"
    ],
    "IEnumerable": [
      "toSpliced",
      "with"
    ],
    "ILinkedItemEnumerable": [
      "toSpliced",
      "with"
    ],
    "IList": [
      "toSpliced",
      "with"
    ],
    "IListEnumerable": [
      "toSpliced",
      "with"
    ],
    "IMap": [
      "toSpliced",
      "with"
    ],
    "IObservableCollection": [
      "addEventListener",
      "removeEventListener",
      "toSpliced",
      "with"
    ],
    "List": [
      "toSpliced",
      "with",
      "toSpliced",
      "with"
    ],
    "ListEnumerable": [
      "toSpliced",
      "with"
    ],
    "ObservableCollection": [
      "addEventListener",
      "removeEventListener",
      "toSpliced",
      "with"
    ],
    "YList": [
      "toSpliced",
      "with",
      "toSpliced",
      "with"
    ],
    "Rect": [
      "fromPoints",
      "sum"
    ],
    "ClipboardGraphCopier": [
      "addEventListener",
      "removeEventListener"
    ],
    "FilteredGraphWrapper": [
      "addEventListener",
      "removeEventListener"
    ],
    "Graph": [
      "addEventListener",
      "removeEventListener"
    ],
    "GraphClipboard": [
      "addEventListener",
      "removeEventListener"
    ],
    "GraphCopier": [
      "addEventListener",
      "removeEventListener"
    ],
    "GraphWrapperBase": [
      "addEventListener",
      "removeEventListener"
    ],
    "IFoldingView": [
      "addEventListener",
      "removeEventListener"
    ],
    "IGraph": [
      "addEventListener",
      "removeEventListener"
    ],
    "ITable": [
      "addEventListener",
      "removeEventListener"
    ],
    "Table": [
      "addEventListener",
      "removeEventListener"
    ],
    "UndoEngine": [
      "addEventListener",
      "removeEventListener"
    ],
    "GraphMLIOHandler": [
      "addEventListener",
      "removeEventListener"
    ],
    "IParseEvents": [
      "addEventListener",
      "removeEventListener"
    ],
    "IWriteEvents": [
      "addEventListener",
      "removeEventListener"
    ],
    "CoordinateAssigner": [
      "maximumPortDeviation"
    ],
    "HierarchicalLayout": [
      "createLayoutData",
      "ensure"
    ],
    "HierarchicalLayoutCore": [
      "layerAssignment"
    ],
    "HierarchicalLayoutData": [
      "incrementalNodeHints"
    ],
    "HierarchicalLayoutEdgeType": [
      "EDGE_GROUP_REPRESENTATIVE"
    ],
    "HierarchicalLayoutNodeDescriptor": [
      "createCopy"
    ],
    "IncrementalNodeHint": [
      "allowDistanceViolations",
      "allowNodeOverlaps",
      "createExactCoordinatesHint",
      "isLayeringFromSketch",
      "isSequencingFromSketch",
      "toString",
      "useExactLayerCoordinate",
      "useExactSequenceCoordinate"
    ],
    "LayerConstraintData": [
      "createComponentComparable"
    ],
    "SequenceConstraintData": [
      "createComponentComparable"
    ],
    "ClickInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "ConcurrencyController": [
      "addEventListener",
      "removeEventListener"
    ],
    "ContextMenuInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "CreateBendInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "CreateEdgeInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "DropInputMode": [
      "acceptDrag"
    ],
    "EditLabelInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "GraphEditorInputMode": [
      "addEventListener",
      "keepToolTipItems",
      "onPopoverManagerChanged",
      "popoverManager",
      "removeEventListener"
    ],
    "GraphInputMode": [
      "addEventListener",
      "keepToolTipItems",
      "onPopoverManagerChanged",
      "popoverManager",
      "removeEventListener"
    ],
    "GraphViewerInputMode": [
      "addEventListener",
      "keepToolTipItems",
      "onPopoverManagerChanged",
      "popoverManager",
      "removeEventListener"
    ],
    "GridConstraintProvider": [
      "snapToGrid",
      "create",
      "gridOrigin",
      "horizontalGridWidth",
      "snapBendToGrid",
      "verticalGridWidth",
      "create",
      "gridOrigin",
      "horizontalGridWidth",
      "snapNodeToGrid",
      "verticalGridWidth",
      "create",
      "gridOrigin",
      "horizontalGridWidth",
      "verticalGridWidth"
    ],
    "HandleInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "IBendGridConstraintProvider": [
      "create",
      "gridOrigin",
      "horizontalGridWidth",
      "snapBendToGrid",
      "verticalGridWidth"
    ],
    "INodeGridConstraintProvider": [
      "create",
      "gridOrigin",
      "horizontalGridWidth",
      "snapNodeToGrid",
      "verticalGridWidth"
    ],
    "InputModeBase": [
      "addEventListener",
      "removeEventListener"
    ],
    "IPortGridConstraintProvider": [
      "create",
      "gridOrigin",
      "horizontalGridWidth",
      "verticalGridWidth"
    ],
    "ItemDropInputMode": [
      "acceptDrag"
    ],
    "ItemHoverInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "KeyboardInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "LabelDropInputMode": [
      "acceptDrag"
    ],
    "LassoSelectionInputMode": [
      "lassoRenderer"
    ],
    "MarqueeSelectionInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "MoveInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "MoveViewportInputMode": [
      "addEventListener",
      "isDragging",
      "removeEventListener"
    ],
    "NavigationInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "NodeDropInputMode": [
      "acceptDrag"
    ],
    "OrthogonalEdgeEditingContext": [
      "addEventListener",
      "removeEventListener"
    ],
    "PortDropInputMode": [
      "acceptDrag"
    ],
    "QueryItemToolTipEventArgs": [
      "popover"
    ],
    "QueryToolTipEventArgs": [
      "popover"
    ],
    "ReparentStripeInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "ReparentStripePositionHandler": [
      "addEventListener",
      "removeEventListener"
    ],
    "ResizeStripeInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "StripeDropInputMode": [
      "acceptDrag"
    ],
    "TableEditorInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "TextEditorInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "ToolTipInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "WaitInputMode": [
      "addEventListener",
      "removeEventListener"
    ],
    "GenericLabeling": [
      "createLayoutData"
    ],
    "IPropertyObservable": [
      "addEventListener",
      "removeEventListener"
    ],
    "ListenerOptions": [
      "once",
      "signal"
    ],
    "Workarounds": [
      "cspNonce"
    ],
    "AlignmentStage": [
      "createLayoutData"
    ],
    "BendSubstitutionStage": [
      "createLayoutData"
    ],
    "ComponentLayout": [
      "createLayoutData"
    ],
    "CurveFittingStage": [
      "createLayoutData"
    ],
    "GenericLayoutGridStage": [
      "createLayoutData"
    ],
    "GivenCoordinatesLayout": [
      "createLayoutData"
    ],
    "LayoutAnchoringStage": [
      "createLayoutData"
    ],
    "LayoutExecutor": [
      "cancel"
    ],
    "LayoutExecutorAsync": [
      "stop"
    ],
    "LayoutGraph": [
      "reinsert(LayoutEdgeLabel)",
      "reinsert(LayoutNodeLabel)"
    ],
    "LayoutGraphHider": [
      "hide(LayoutEdgeLabel)",
      "hide(LayoutNodeLabel)",
      "hideEdgeLabels",
      "hideNodeLabels",
      "unhide(LayoutEdgeLabel)",
      "unhide(LayoutNodeLabel)",
      "unhideEdgeLabels",
      "unhideNodeLabels"
    ],
    "PlaceNodesAtBarycenterStage": [
      "createLayoutData"
    ],
    "PortPlacementStage": [
      "createLayoutData"
    ],
    "RadialGroupLayout": [
      "createLayoutData"
    ],
    "RecursiveGroupLayout": [
      "createLayoutData"
    ],
    "RemoveOverlapsStage": [
      "createLayoutData"
    ],
    "SubgraphLayoutStage": [
      "createLayoutData"
    ],
    "TabularLayout": [
      "createLayoutData"
    ],
    "TemporaryGroupInsertionStage": [
      "createLayoutData"
    ],
    "MultiPageLayout": [
      "createLayoutData"
    ],
    "OrganicLayout": [
      "createLayoutData",
      "ensure"
    ],
    "OrthogonalLayout": [
      "createLayoutData"
    ],
    "ClearAreaLayout": [
      "createLayoutData"
    ],
    "FillAreaLayout": [
      "createLayoutData"
    ],
    "PartialLayout": [
      "createLayoutData",
      "ensure"
    ],
    "RadialLayout": [
      "createLayoutData",
      "ensure"
    ],
    "BundledEdgeRouter": [
      "routingMode"
    ],
    "CurveRoutingStage": [
      "createLayoutData"
    ],
    "EdgeRouter": [
      "createLayoutData",
      "ensure"
    ],
    "OctilinearRoutingStage": [
      "createLayoutData"
    ],
    "OrganicEdgeRouter": [
      "createLayoutData"
    ],
    "ParallelEdgeRouter": [
      "createLayoutData(IGraph)",
      "createLayoutData(LayoutGraph)"
    ],
    "SelfLoopRouter": [
      "createLayoutData"
    ],
    "StraightLineEdgeRouter": [
      "createLayoutData"
    ],
    "SeriesParallelLayout": [
      "createLayoutData"
    ],
    "LabelShape": [
      "SQUIRCLE"
    ],
    "RectangleCornerStyle": [
      "SQUIRCLE"
    ],
    "ShapeNodeShape": [
      "SQUIRCLE"
    ],
    "ShapePortStyle": [
      "cssClass"
    ],
    "TextWrappingShape": [
      "SQUIRCLE"
    ],
    "RadialTreeLayout": [
      "createLayoutData"
    ],
    "TreeLayout": [
      "createLayoutData",
      "ensure"
    ],
    "TreeMapLayout": [
      "createLayoutData"
    ],
    "TreeReductionStage": [
      "createLayoutData"
    ],
    "BridgeManager": [
      "maximumBridgeWidth"
    ],
    "CanvasComponent": [
      "addEventListener",
      "removeEventListener"
    ],
    "DragSource": [
      "addEventListener",
      "removeEventListener"
    ],
    "DropTarget": [
      "addEventListener",
      "removeEventListener"
    ],
    "FocusIndicatorManager": [
      "addEventListener",
      "removeEventListener"
    ],
    "GraphComponent": [
      "addEventListener",
      "removeEventListener"
    ],
    "GraphOverviewComponent": [
      "addEventListener",
      "removeEventListener"
    ],
    "IGraphSelection": [
      "addEventListener",
      "removeEventListener",
      "toSpliced",
      "with"
    ],
    "IRenderContext": [
      "setConnectedCallback"
    ],
    "IRenderTreeGroup": [
      "toSpliced",
      "with"
    ],
    "IStripeSelection": [
      "addEventListener",
      "removeEventListener",
      "toSpliced",
      "with"
    ],
    "LinearGradient": [
      "gradientTransform"
    ],
    "PatternFill": [
      "patternTransform"
    ],
    "RadialGradient": [
      "gradientTransform"
    ],
    "SvgVisualGroup": [
      "from"
    ],
    "WebGLArcEdgeStyle": [
      "zoomVisibilityPolicy"
    ],
    "WebGLBridgeEdgeStyle": [
      "zoomVisibilityPolicy"
    ],
    "WebGLGraphModelManager": [
      "addEventListener",
      "getStyle(IPort)",
      "getWebGLPortStyle",
      "removeEventListener",
      "updatePortPosition"
    ],
    "WebGLGroupNodeStyle": [
      "minimumContentAreaSize",
      "zoomVisibilityPolicy"
    ],
    "WebGLIconLabelStyle": [
      "zoomScalingPolicy",
      "zoomVisibilityPolicy"
    ],
    "WebGLImageNodeStyle": [
      "zoomVisibilityPolicy"
    ],
    "WebGLLabelIndicatorShape": [
      "SQUIRCLE"
    ],
    "WebGLLabelShape": [
      "SQUIRCLE"
    ],
    "WebGLLabelStyle": [
      "zoomScalingPolicy",
      "zoomVisibilityPolicy"
    ],
    "WebGLNodeIndicatorShape": [
      "SQUIRCLE"
    ],
    "WebGLPolylineEdgeStyle": [
      "zoomVisibilityPolicy"
    ],
    "WebGLShapeNodeShape": [
      "SQUIRCLE"
    ],
    "WebGLShapeNodeStyle": [
      "zoomVisibilityPolicy"
    ],
    "WebGLSupport": [
      "addEventListener",
      "removeEventListener"
    ],
    "UNRESOLVED.WebGLFocusIndicatorManager": [
      "addEventListener",
      "removeEventListener"
    ]
  },
  "signaturesChanged": {
    "LayoutGraphAlgorithms": {
      "findReachableNodes": [
        0,
        1,
        -1
      ]
    },
    "WebGLGraphModelManager": {
      "updateStyle(IEdge)": [
        -1
      ],
      "updateStyle(ILabel)": [
        -1
      ],
      "updateStyle(INode)": [
        -1
      ]
    }
  },
  "returnTypesChanged": {
    "CreateEdgeInputMode": {
      "createEdge": "Promise<IEdge | null> | IEdge"
    },
    "DropInputMode": {
      "adjustEffect": ""
    },
    "GraphEditorInputMode": {
      "createNode": "Promise<INode | null> | INode"
    },
    "ItemDropInputMode": {
      "adjustEffect": ""
    },
    "LabelDropInputMode": {
      "adjustEffect": ""
    },
    "NodeDropInputMode": {
      "adjustEffect": ""
    },
    "PortDropInputMode": {
      "adjustEffect": ""
    },
    "StripeDropInputMode": {
      "adjustEffect": ""
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
    "ResultItemCollection": {
      "EMPTY": "IList<T>"
    },
    "ResultItemMapping": {
      "EMPTY": "IList<T>"
    },
    "HashMap": {
      "EMPTY": "IList<T>"
    },
    "ICollection": {
      "EMPTY": "IList<T>"
    },
    "IEnumerable": {
      "EMPTY": "IList<T>"
    },
    "ILinkedItemEnumerable": {
      "EMPTY": "IList<T>"
    },
    "IList": {
      "EMPTY": "IList<T>"
    },
    "IListEnumerable": {
      "EMPTY": "IList<T>"
    },
    "IMap": {
      "EMPTY": "IList<T>"
    },
    "IObservableCollection": {
      "EMPTY": "IList<T>"
    },
    "List": {
      "EMPTY": "IList<T>"
    },
    "ListEnumerable": {
      "EMPTY": "IList<T>"
    },
    "ObservableCollection": {
      "EMPTY": "IList<T>"
    },
    "YList": {
      "EMPTY": "IList<T>"
    },
    "IncrementalNodeHint": {
      "INCREMENTAL_GROUP": "IncrementalNodeHint",
      "LAYER_INCREMENTALLY": "IncrementalNodeHint",
      "NONE": "IncrementalNodeHint",
      "SEQUENCE_INCREMENTALLY": "IncrementalNodeHint",
      "USE_EXACT_COORDINATES": "IncrementalNodeHint"
    },
    "GraphSnapContext": {
      "bendGridConstraintProvider": "IBendGridConstraintProvider",
      "nodeGridConstraintProvider": "INodeGridConstraintProvider",
      "portGridConstraintProvider": "IPortGridConstraintProvider"
    },
    "LabelTextValidatingEventArgs": {
      "validatedText": "Promise<string | null> | string"
    },
    "Workarounds": {
      "mouseWheelParameters": "Partial<{\n    mouseWheelThreshold: number;\n    mouseWheelMax: number;\n    mouseWheelFactor: number;\n    trackpadPinchMax: number;\n    trackpadPinchFactor: number;\n    trackpadPanMax: number;\n    trackpadPanFactor: number;\n    resetTime: number;\n}> | undefined"
    },
    "DragSource": {
      "source": "HTMLElement | SVGElement"
    },
    "Font": {
      "fontWeight": "'normal' | 'bold' | 'light' | 'bolder' | 'lighter' | 'inherit' | string"
    },
    "IGraphSelection": {
      "EMPTY": "IList<T>"
    },
    "IRenderTreeGroup": {
      "EMPTY": "IList<T>"
    },
    "IStripeSelection": {
      "EMPTY": "IList<T>"
    },
    "PointerEventArgs": {
      "originalEvent": "PointerEvent | WheelEvent"
    },
    "WebGLEdgeStyleDecorator": {
      "webGLStyle": "WebGLPolylineEdgeStyle | WebGLArcEdgeStyle | WebGLBridgeEdgeStyle"
    },
    "WebGLFocusIndicatorManager": {
      "edgeStyle": "WebGLEdgeIndicatorStyle | WebGLBeaconEdgeIndicatorStyle",
      "nodeStyle": "WebGLNodeIndicatorStyle | WebGLBeaconNodeIndicatorStyle"
    },
    "WebGLGroupNodeStyle": {
      "contentAreaPadding": "Insets"
    },
    "WebGLHighlightIndicatorManager": {
      "edgeStyle": "WebGLEdgeIndicatorStyle | WebGLBeaconEdgeIndicatorStyle",
      "nodeStyle": "WebGLNodeIndicatorStyle | WebGLBeaconNodeIndicatorStyle"
    },
    "WebGLLabelStyleDecorator": {
      "webGLStyle": "WebGLLabelStyle | WebGLIconLabelStyle"
    },
    "WebGLNodeStyleDecorator": {
      "webGLStyle": "WebGLShapeNodeStyle | WebGLImageNodeStyle | WebGLGroupNodeStyle"
    },
    "WebGLSelectionIndicatorManager": {
      "edgeStyle": "WebGLEdgeIndicatorStyle | WebGLBeaconEdgeIndicatorStyle",
      "nodeStyle": "WebGLNodeIndicatorStyle | WebGLBeaconNodeIndicatorStyle"
    }
  },
  "methodsProperties": {},
  "compatMethods": {},
  "typesRenamed": {
    "GroupBoundsCalculator": "LayoutGroupBoundsCalculator"
  },
  "constructorMappings": {}
}
