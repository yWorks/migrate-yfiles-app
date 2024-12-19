import { GraphEditorInputMode } from 'yfiles'

const geim = new GraphEditorInputMode()
geim.addLabelEditingListener((s,e)=>{
  console.log(e.owner)
})
