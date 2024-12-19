import { GraphComponent } from 'yfiles'

const gc = new GraphComponent()
const group = gc.renderTree.contentGroup
group.renderTree.createGroup(group)
