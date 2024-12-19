import {GivenLayersAssigner, LayoutGraph, HierarchicLayout } from 'yfiles'

function minimizeCrossings(graph: LayoutGraph): void {
  const keyLayers = GivenLayersAssigner.LAYER_INDEX_DATA_KEY
  const oldLayerIds = graph.context.getItemData(keyLayers)
  graph.context.addItemData(keyLayers, () => 0)

  const keySequence = HierarchicLayout.SEQUENCE_INDEX_DP_KEY
  const oldSequenceIndices = graph.context.getItemData(keySequence)
  graph.context.addItemData(keySequence, ()=> 0)
  if (oldSequenceIndices) {
    graph.context.addItemData(keySequence, oldSequenceIndices)
  } else {
    graph.context.remove(keySequence)
  }

  // restore original layer ID data provider
  if (oldLayerIds) {
    graph.context.addItemData(keyLayers, oldLayerIds)
  } else {
    graph.context.remove(keyLayers)
  }
}
