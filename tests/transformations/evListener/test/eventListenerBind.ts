import type { NavigationInputMode } from 'yfiles'

class someClass{
  navigationInputMode: NavigationInputMode

  handler(sender, event){
    console.log(sender, event)
  }
  constructor(navigationInputMode: NavigationInputMode) {
    this.navigationInputMode = navigationInputMode
    this.navigationInputMode.addGroupExpandingListener(this.handler.bind(this))
  }
}
