import {ShapeNodeStyle, VoidStripeStyle, VoidEdgeStyle, IStripeStyle, IEdgeStyle } from 'yfiles'

const otherStyle = new ShapeNodeStyle()

const someStyle = otherStyle instanceof IStripeStyle.VOID_STRIPE_STYLE

if(otherStyle instanceof IEdgeStyle.VOID_EDGE_STYLE){
  console.log("VoidEdgeStyle")
}