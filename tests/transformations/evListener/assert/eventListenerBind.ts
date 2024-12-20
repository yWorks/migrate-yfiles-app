import type { NavigationInputMode } from 'yfiles'

class someClass{
  navigationInputMode: NavigationInputMode

  handler(event, sender){
    console.log(sender, event)
  }
  constructor(navigationInputMode: NavigationInputMode) {
    this.navigationInputMode = navigationInputMode
    this.navigationInputMode.addEventListener('group-expanding', this.handler.bind(this))
  }
}
