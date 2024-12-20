import { CanvasComponent, ICanvasObjectGroup } from 'yfiles'
class myCC extends CanvasComponent{
  constructor() {
    super()
  }
  protected createContentGroup(): ICanvasObjectGroup{
    console.log('createContentGroup')
    return
  }
}
