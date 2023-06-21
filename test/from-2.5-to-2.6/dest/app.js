import { OrganicLayoutStarSubstructureStyle } from "yfiles";
import {
    CactusGroupLayout,
    Exception,
    NodeStyleBase,
    OrganicLayoutStarSubstructureStyle,
    YObject
} from 'yfiles'

const comparator = CactusGroupLayout.defaultNodeComparer

const layoutStyleFqn = OrganicLayoutStarSubstructureStyle.CIRCULAR
const layoutStyle = OrganicLayoutStarSubstructureStyle.CIRCULAR

new Exception().cause

YObject.referenceEquals({}, {})

class MyNodeStyle extends NodeStyleBase {
    createVisual(context, node) {
        return null
    }
}