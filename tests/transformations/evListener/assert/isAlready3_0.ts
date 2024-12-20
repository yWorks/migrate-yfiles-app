import { GraphEditorInputMode,IModelItem, ItemClickedEventArgs } from 'yfiles'

const geim = new GraphEditorInputMode()

geim.addEventListener('item-clicked', ( item : ItemClickedEventArgs<IModelItem>) => {
  console.log(item)
})
