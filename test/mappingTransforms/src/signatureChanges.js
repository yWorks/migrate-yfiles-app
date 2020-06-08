function foo(edgeStyle) {
  return edgeStyle.isHit(1, 2)
}

const sns = new yfiles.drawing.ShapeNodeStyle.WithRendererShapePenAndBrush(renderer, shape, stroke, fill)

function lessArgs(gmm) {
  return gmm.getCanvasObjectGroupForEdge(one, two)
}

function swap(labelModel) {
  return labelModel.getGeometry(one, two)
}

function swapALot(graphWrapper) {
  graphWrapper.addLabelWithParameterStylePreferredSizeAndTag(one, two, three, four, five, six)
}

function lessArgs2(portCandidateProvider) {
  return portCandidateProvider.getSourcePortCandidates(one, two, three, four)
}

function moreArgs(clipBoard) {
  return clipBoard.pasteSubsetWithCallbackAndContext(one, two, three)
}

function leaveAddAlone(set) {
  set.add('foo')
}

function dontAdjustPartialRenames(thing) {
  thing.getItem(0)
}
