import {ShapeNodeStyle, VoidStripeStyle, VoidEdgeStyle } from 'yfiles'

const otherStyle = new ShapeNodeStyle()

const someStyle = otherStyle instanceof VoidStripeStyle

if(otherStyle instanceof VoidEdgeStyle){
  console.log("VoidEdgeStyle")
}