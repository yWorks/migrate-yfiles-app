import {GivenLayersAssigner, LayoutGraph, HierarchicLayout } from 'yfiles'

function minimizeCrossings(graph: LayoutGraph): void {
  const keyLayers = GivenLayersAssigner.LAYER_INDEX_DATA_KEY
  const oldLayerIds = graph.getDataProvider(keyLayers)
  graph.addDataProvider(keyLayers, () => 0)

  const keySequence = HierarchicLayout.SEQUENCE_INDEX_DP_KEY
  const oldSequenceIndices = graph.getDataProvider(keySequence)
  graph.addDataProvider(keySequence, ()=> 0)
  if (oldSequenceIndices) {
    graph.addDataProvider(keySequence, oldSequenceIndices)
  } else {
    graph.removeDataProvider(keySequence)
  }

  // restore original layer ID data provider
  if (oldLayerIds) {
    graph.addDataProvider(keyLayers, oldLayerIds)
  } else {
    graph.removeDataProvider(keyLayers)
  }
}
