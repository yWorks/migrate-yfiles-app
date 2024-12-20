import { GraphEditorInputMode,IModelItem, ItemClickedEventArgs } from 'yfiles'

const geim = new GraphEditorInputMode()

geim.addItemClickedListener(( item : ItemClickedEventArgs<IModelItem>) => {
  console.log(item)
})
