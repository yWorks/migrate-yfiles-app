import { IModelItem, ItemHoverInputMode } from 'yfiles'

let hoveredItem: IModelItem

const itemHoverInputMode = new ItemHoverInputMode()
itemHoverInputMode.addHoveredItemChangedListener((sender, evt) => {
    hoveredItem = evt.item
})
