import {HierarchicLayout,LayoutMode} from 'yfiles'

const layout = new HierarchicLayout()
layout.recursiveGroupLayering = false
layout.layoutMode = LayoutMode.INCREMENTAL
layout.layoutMode = LayoutMode.FROM_SCRATCH
layout.considerNodeLabels = true
layout.considerNodeLabels = false
layout.integratedEdgeLabeling = true
layout.integratedEdgeLabeling = false
layout.maximumDuration = 0
