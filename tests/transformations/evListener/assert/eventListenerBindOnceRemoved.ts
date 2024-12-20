import type { NavigationInputMode } from 'yfiles'

class someClass{
  navigationInputMode: NavigationInputMode

  handler(event, sender){
    console.log(sender, event)
  }
  handler2 = this.handler.bind(this)

  constructor(navigationInputMode: NavigationInputMode) {
    this.navigationInputMode = navigationInputMode
    this.navigationInputMode.addEventListener('group-expanding', this.handler2)
  }
}
