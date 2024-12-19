import { GraphComponent } from 'yfiles'

const gc = new GraphComponent()
gc.createRenderContext().canvasComponent?.renderTree.backgroundGroup./*TODO-Migration addGroup has been moved to renderTree and renamed to createGroup, which is on the ICanvasObject(Group) and now takes the object as argument, check if the function returning ICanvasObject(Group) has no unintended side-effect when called more than once*/addGroup()
