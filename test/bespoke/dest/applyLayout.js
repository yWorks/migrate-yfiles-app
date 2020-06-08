// ILayouter.applyLayout is removed, emit warning to use graph.applyLayout(layouter) instead
// ILayouter.doLayout was renamed to ILayouter.applyLayout!
// => applyLayout still exists, but the call is probably wrong now!
layouter.applyLayout(graph)

// graph.applyLayout existed before - don't touch it
graph.applyLayout(layout)
