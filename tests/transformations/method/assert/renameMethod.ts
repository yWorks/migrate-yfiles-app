import { CanvasComponent, ICanvasObjectGroup } from 'yfiles'
class myCC extends CanvasComponent{
  constructor() {
    super()
  }
  protected newMethod(): ICanvasObjectGroup{
    console.log('createContentGroup')
    return
  }
}
