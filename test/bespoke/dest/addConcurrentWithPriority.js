// is this comment kept?
this.createShapeInputMode.priority = graphEditorInputMode.marqueeSelectionInputMode.priority;

graphEditorInputMode.add(this.createShapeInputMode);
// is this comment kept?
graphEditorInputMode.addConcurrentWithPriority(createShapeInputMode, graphEditorInputMode.marqueeSelectionModePriority, thirdArg);

graphEditorInputMode.addConcurrentWithPriority(createShapeInputMode, somethingElse.marqueeSelectionModePriority);
