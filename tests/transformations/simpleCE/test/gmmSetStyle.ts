import {GraphComponent, WebGL2GraphModelManager, WebGL2IconNodeStyle } from 'yfiles'
let webGL2NodeStyle: WebGL2IconNodeStyle
const gc = new GraphComponent()
const gmm = gc.graphModelManager as WebGL2GraphModelManager
gmm.setStyle(gmm.graph?.createNode(), webGL2NodeStyle)
