import {
    CactusGroupLayout,
    Exception,
    NodeStyleBase,
    StarSubstructureStyle,
    YObject
} from 'yfiles'

const comparator = CactusGroupLayout.defaultNodeComparator

const layoutStyleFqn = yfiles.organic.StarSubstructureStyle.CIRCULAR
const layoutStyle = StarSubstructureStyle.CIRCULAR

new Exception().cause

YObject.referenceEquals({}, {})

class MyNodeStyle extends NodeStyleBase {
    createVisual(context, node) {
        return null
    }
}