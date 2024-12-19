import { GraphEditorInputMode,IModelItem, ItemClickedEventArgs } from 'yfiles'

const geim = new GraphEditorInputMode()

geim.addItemClickedListener((_, { item }: ItemClickedEventArgs<IModelItem>) => {
  console.log(item)
})
