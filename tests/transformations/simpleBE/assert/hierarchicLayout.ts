import {HierarchicLayout,LayoutMode} from 'yfiles'

const layout = new HierarchicLayout()
layout.groupLayeringPolicy = GroupLayeringPolicy.IGNORE_GROUPS
layout.fromSketchMode = true
layout.fromSketchMode = false
layout.nodeLabelPlacement = NodeLabelPlacement.CONSIDER
layout.nodeLabelPlacement = NodeLabelPlacement.IGNORE
layout.edgeLabelPlacement = EdgeLabelPlacement.INTEGRATED
layout.edgeLabelPlacement = EdgeLabelPlacement.IGNORE
layout.maximumDuration = TimeSpan.MAX_VALUE
