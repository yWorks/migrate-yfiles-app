import { GraphComponent } from 'yfiles'

const graphComponent = new GraphComponent()

graphComponent.selection.addItemSelectionChangedListener((): void => {
  console.log("A")
})
