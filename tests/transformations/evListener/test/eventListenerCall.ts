import type { NavigationInputMode } from 'yfiles'

class someClass{
  navigationInputMode: NavigationInputMode

  handler(){
    return (a, b) => console.log(a, b)
  }
  constructor(navigationInputMode: NavigationInputMode) {
    this.navigationInputMode = navigationInputMode
    this.navigationInputMode.addGroupExpandingListener(this.handler())
  }
}
