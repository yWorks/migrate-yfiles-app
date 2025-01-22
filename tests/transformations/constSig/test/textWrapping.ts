import {DefaultLabelStyle, TextWrapping} from 'yfiles'

const labelStyle1 = new DefaultLabelStyle({
  clipText: false,
  wrapping: 'none'
})

const labelStyle2 = new DefaultLabelStyle({
  clipText: true,
  wrapping: 'none'
})

const labelStyle3 = new DefaultLabelStyle({
  wrapping: 'none'
})

const labelStyle4 = new DefaultLabelStyle({
  wrapping: TextWrapping.NONE
})

const labelStyle5 = new DefaultLabelStyle({
  wrapping: 'character'
})