export default {
  membersRenamed: {
    LookupDecorator: {
      'setFactory(TYPE)': 'addFactory(TYPE)',
      'setFactory(TYPE,TYPE)': 'addFactory(TYPE,TYPE)',
      'setImplementationWrapper(TYPE,TYPE)': 'addWrapperFactory(TYPE,TYPE)',
      'setImplementationWrapper(TYPE)': 'addWrapperFactory(TYPE)'
    },
    ViewportAnimation: {
      canvas: 'canvasComponent'
    },
    ISelectionModel: {
      isSelected: 'includes'
    }
  },
  signaturesChanged: {
    BezierEdgePathLabelModel: {
      findBestParameter: [0, 2]
    },
    BezierEdgeSegmentLabelModel: {
      findBestParameter: [0, 2]
    },
    CompositeLabelModel: {
      findBestParameter: [0, 2]
    },
    EdgePathLabelModel: {
      findBestParameter: [0, 2]
    },
    EdgeSegmentLabelModel: {
      findBestParameter: [0, 2]
    },
    FreeEdgeLabelModel: {
      findBestParameter: [0, 2]
    },
    FreeLabelModel: {
      findBestParameter: [0, 2]
    },
    FreeNodeLabelModel: {
      findBestParameter: [0, 2]
    },
    FreePortLabelModel: {
      findBestParameter: [0, 2]
    }
  }
}
