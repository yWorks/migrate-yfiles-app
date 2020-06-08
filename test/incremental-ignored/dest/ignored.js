// @migration-ignore
arrow.brush = brush

graphEditorInputMode.addConcurrentWithPriority(
  this.createShapeInputMode,
  /* @migration-ignore */ graphEditorInputMode.marqueeSelectionModePriority
)

// @migration-ignore
treeSource.childBinding = new yfiles.binding.Binding('subordinates')

// @migration-ignore
visual.setRenderDataCache(obj)

// @migration-ignore
var VariableLazyClass = new yfiles.ClassDefinition(function() {
  return {
    // @migration-ignore
    $extends: yfiles.drawing.SimpleAbstractNodeStyle,
    constructor: function(foo, bar) {
      // @migration-ignore
      yfiles.drawing.SimpleAbstractNodeStyle.call(this, foo, bar)
      console.log('simple constructor')
    }
  }
})

const yfiles = require('../../../../lib/yfiles/view-component')

const node3 = graph.createNode(new yfiles.geometry.Rect(100, 150, 30, 30))

;(function(r) {
  ;(function(f) {
    if ('function' == typeof define && define.amd) {
      define(['yfiles/lang', 'yfiles/core-lib'], f)
    } else if (
      'object' === typeof exports &&
      'undefined' !== typeof module &&
      'object' === typeof module.exports
    ) {
      module.exports = f(require('yfiles/lang'), require('yfiles/core-lib'))
    } else {
      f(r.yfiles.lang, r.yfiles)
    }
  })(function(lang, yfiles) {})
})()

// @migration-ignore
hl.mirrorMask = 5

// @migration-ignore
const container = new yfiles.canvas.CanvasContainer()

// @migration-ignore
yfiles.module('foo',function(exports) {
  console.log("hi")
})

// @migration-ignore
var cmd = new yfiles.system.RoutedUICommand

const edgeLabelModel = new yfiles.graph.EdgePathLabelModel({
  // @migration-ignore
  autoRotationEnabled: true,
  distance: 10,
  sideOfEdge: yfiles.graph.EdgeSides.LEFT_OF_EDGE | yfiles.graph.EdgeSides.RIGHT_OF_EDGE
});

function swapALot(graphWrapper) {
  // @migration-ignore
  graphWrapper.addLabelWithParameterStylePreferredSizeAndTag(one, two, three, four, five, six)
}

function foo(handleProvider) {
  // @migration-ignore
  return handleProvider.getHandles()
}
