import { GraphComponent } from 'yfiles'

const graphComponent = new GraphComponent()

graphComponent.selection.addEventListener('item-selection-changed'/*TODO-Migration Add two listeners with "item-added" and "item-removed" to achieve the previous behavior*/, (): void => {
  console.log("A")
})
