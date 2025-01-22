import {DefaultLabelStyle, TextWrapping} from 'yfiles'

const labelStyle1 = new DefaultLabelStyle({
  clipText: false,
  wrapping: 'none'
})

const labelStyle2 = new DefaultLabelStyle({
  clipText: true,
  wrapping: 'clip'
})

const labelStyle3 = new DefaultLabelStyle({
  wrapping: 'clip'
})

const labelStyle4 = new DefaultLabelStyle({
  wrapping: TextWrapping.CLIP
})

const labelStyle5 = new DefaultLabelStyle({
  wrapping: 'wrap-character'
})