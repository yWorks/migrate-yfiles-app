arrow.brush = brush

graphEditorInputMode.addConcurrentWithPriority(
  this.createShapeInputMode,
  graphEditorInputMode.marqueeSelectionModePriority
)

treeSource.childBinding = new yfiles.binding.Binding('subordinates')

visual.setRenderDataCache(obj)

var VariableLazyClass = new yfiles.ClassDefinition(function() {
  return {
    $extends: yfiles.drawing.SimpleAbstractNodeStyle,
    constructor: function(foo, bar) {
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

hl.mirrorMask = 5

const container = new yfiles.canvas.CanvasContainer()

var cmd = new yfiles.system.RoutedUICommand

const edgeLabelModel = new yfiles.graph.EdgePathLabelModel({
  autoRotationEnabled: true,
  distance: 10,
  sideOfEdge: yfiles.graph.EdgeSides.LEFT_OF_EDGE | yfiles.graph.EdgeSides.RIGHT_OF_EDGE
});

function swapALot(graphWrapper) {
  graphWrapper.addLabelWithParameterStylePreferredSizeAndTag(one, two, three, four, five, six)
}

function foo(handleProvider) {
  return handleProvider.getHandles()
}

