import {
  GraphComponent,
  WebGL2Effect,
  Exception,
  HighlightIndicatorManager
} from 'yfiles'

const gc = new GraphComponent()

new yfiles.layout.NodeLabelingPolicy()
new foo.bar.NodeLabelingPolicy()

new WebGL2Effect()

new Exception().cause

const mm = new HighlightIndicatorManager(gc)

mm.install(item)
mm.install(gc, context)

new SelectionIndicatorManager(gc, model, selectionModel)
new HighlightIndicatorManager(gc, selectionModel)
