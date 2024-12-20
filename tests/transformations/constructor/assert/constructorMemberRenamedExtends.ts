import { OrganicLayout } from 'yfiles'

class customOL extends OrganicLayout {
  constructor(options: object) {
    super(options)
  }
}

const ol = new customOL({
  circleRecognition: true,
})
