import {
  compareSignatureWithTypes,
  getAliasBaseTypes,
  getDeclaringClass,
  getType,
  type ITransformation,
  type loggingFunction,
  reorderCallExpressionParameters
} from '../utils.js'
import {
  LeftHandSideExpression,
  type PropertyAccessExpression,
  type SourceFile,
  SyntaxKind
} from 'ts-morph'
import type { StatisticsReport } from '../statisticsReport.js'

export class RenderTreeTransformations implements ITransformation {
  sourceFile: SourceFile
  statisticsReporting: StatisticsReport
  loggingFunction: loggingFunction
  canvasComponentToRenderTree = [
    'foregroundGroup',
    'backgroundGroup',
    'contentGroup',
    'rootGroup',
    'focusGroup',
    'highlightGroup',
    'inputModeGroup',
    'getBounds',
    'getVisual',
    'getVisualCreator',
    'isHit'
  ]
  createElementTypes = ['IVisualCreator', 'ILookup', 'Visual']
  canvasComponentToRenderTreeRename: Record<string, string> = {
    compareRenderOrder: 'renderOrderComparator',
    getCanvasObjects: 'getElements'
  }
  iCanvasObjectToRenderTreeRename: Record<string, { name: string; argValue: string }> = {
    addGroup: { name: 'createGroup', argValue: 'expression' },
    remove: { name: 'remove', argValue: 'expression' }
  }
  canvasComponentToRenderTreeSignatureChange: Record<
    string,
    Record<string, (number | string | null)[]>
  > = {
    hitElementsAt: {
      'hitElementsAt(Point)': [0, null],
      'hitElementsAt(Point,ICanvasObjectGroup)': [0, null, 1],
      'hitElementsAt(Point,ICanvasObjectGroup,(ICanvasObject)=>boolean)': [0, null, 1],
      'hitElementsAt(IInputModeContext,Point)': [1, 0],
      'hitElementsAt(IInputModeContext,Point,ICanvasObjectGroup)': [1, 0, 2],
      'hitElementsAt(IInputModeContext,Point,ICanvasObjectGroup,(ICanvasObject)=>boolean)': [
        1, 0, 2, 3
      ]
    }
  }
  constructor(
    sourceFile: SourceFile,
    loggingFunction: loggingFunction,
    statisticsReporting: StatisticsReport
  ) {
    this.sourceFile = sourceFile
    this.statisticsReporting = statisticsReporting
    this.loggingFunction = loggingFunction
  }
  transform() {
    this.visitPropertyAccessExpressions((...args) => this.createElement(...args))
    this.visitPropertyAccessExpressions((...args) => this.moveICanvasObjectToRenderTree(...args))
    this.visitPropertyAccessExpressions((...args) => this.moveCanvasComponentToRenderTree(...args))
    this.visitPropertyAccessExpressions((...args) =>
      this.moveCanvasComponentCToRenderTreeRename(...args)
    )
    this.visitPropertyAccessExpressions((...args) =>
      this.moveCanvasComponentToRenderTreeChangeSignature(...args)
    )
    return
  }
  private visitPropertyAccessExpressions(
    visitorFunc: (
      baseTypes: string[],
      type: string,
      leftSide: LeftHandSideExpression,
      rightSide: string,
      propertyAccessExpression: PropertyAccessExpression
    ) => boolean
  ): void {
    let restart = false
    for (const propertyAccessExpression of this.sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAccessExpression
    )) {
      const rightSide = propertyAccessExpression.getName()
      const leftSide = propertyAccessExpression.getExpression()
      const baseTypes = getAliasBaseTypes(leftSide)
      const type = getType(getDeclaringClass(propertyAccessExpression))

      if (
        type &&
        visitorFunc(baseTypes ?? [], type, leftSide, rightSide, propertyAccessExpression)
      ) {
        this.statisticsReporting.addChangeCount('renderTreeTransformations', 1)
        restart = true
        break
      }
    }
    if (restart) {
      this.visitPropertyAccessExpressions((...args) => visitorFunc(...args))
    }
  }
  private moveICanvasObjectToRenderTree(
    baseTypes: string[],
    type: string,
    leftSide: LeftHandSideExpression,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression
  ) {
    const parent = propertyAccessExpression.getParent()
    if (
      parent &&
      parent.isKind(SyntaxKind.CallExpression) &&
      type &&
      type.includes('ICanvasObject') &&
      Object.hasOwn(this.iCanvasObjectToRenderTreeRename, rightSide)
    ) {
      const newRightHandName = this.iCanvasObjectToRenderTreeRename[rightSide].name
      const paeExpression = propertyAccessExpression.getExpression()
      if (paeExpression.isKind(SyntaxKind.Identifier)) {
        parent.replaceWithText(
          parent
            .getText()
            .replace(
              `.${rightSide}()`,
              `.renderTree.${newRightHandName}(${propertyAccessExpression
                .getExpression()
                .getText()})`
            )
        )
        return true
      } else {
        const newNode = this.loggingFunction(
          propertyAccessExpression.getNameNode(),
          [rightSide, rightSide != newRightHandName ? ` and renamed to ${newRightHandName}` : ''],
          '#insert0# has been moved to renderTree#insert1#, which is on the ICanvasObject(Group) and now takes the object as argument, check if the function returning ICanvasObject(Group) has no unintended side-effect when called more than once'
        )
        return false
      }
    }
    return false
  }

  private moveCanvasComponentToRenderTreeChangeSignature(
    baseTypes: string[],
    type: string,
    leftSide: LeftHandSideExpression,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression
  ) {
    const parent = propertyAccessExpression.getParent()
    if (
      parent &&
      parent.isKind(SyntaxKind.CallExpression) &&
      (baseTypes.includes('CanvasComponent') || type === 'CanvasComponent') &&
      Object.hasOwn(this.canvasComponentToRenderTreeSignatureChange, rightSide)
    ) {
      const args = parent.getArguments()
      const matchingSignature = Object.keys(
        this.canvasComponentToRenderTreeSignatureChange[rightSide]
      ).find((signature) => compareSignatureWithTypes(args, rightSide, signature, null))
      if (matchingSignature) {
        const order = this.canvasComponentToRenderTreeSignatureChange[rightSide][matchingSignature]
        reorderCallExpressionParameters(parent, order)
        propertyAccessExpression.replaceWithText(
          `${leftSide.getText()}${propertyAccessExpression.hasQuestionDotToken() ? '?' : ''}.renderTree.${rightSide}`
        )
        return true
      }
    }
    return false
  }

  private moveCanvasComponentCToRenderTreeRename(
    baseTypes: string[],
    type: string,
    leftSide: LeftHandSideExpression,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression
  ) {
    if (
      (baseTypes.includes('CanvasComponent') || type === 'CanvasComponent') &&
      Object.keys(this.canvasComponentToRenderTreeRename).includes(rightSide)
    ) {
      propertyAccessExpression.replaceWithText(
        `${leftSide.getText()}${propertyAccessExpression.hasQuestionDotToken() ? '?' : ''}.renderTree.${this.canvasComponentToRenderTreeRename[rightSide]}`
      )
      return true
    }
    return false
  }

  private moveCanvasComponentToRenderTree(
    baseTypes: string[],
    type: string,
    leftSide: LeftHandSideExpression,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression
  ) {
    if (
      (baseTypes.includes('CanvasComponent') || type === 'CanvasComponent') &&
      this.canvasComponentToRenderTree.includes(rightSide)
    ) {
      propertyAccessExpression.replaceWithText(
        `${leftSide.getText()}${propertyAccessExpression.hasQuestionDotToken() ? '?' : ''}.renderTree.${rightSide}`
      )

      return true
    }
    return false
  }

  private createElement(
    baseTypes: string[],
    type: string,
    leftSide: LeftHandSideExpression,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression
  ) {
    const parent = propertyAccessExpression.getParent()
    const isICanvasObjectGroup = type === 'ICanvasObjectGroup'
    if (
      isICanvasObjectGroup &&
      rightSide === 'addChild' &&
      parent &&
      parent.isKind(SyntaxKind.CallExpression)
    ) {
      const args = parent.getArguments()

      if (args.length > 1) {
        const arg0Type = getType(args[0])
        const arg0BaseTypes = getAliasBaseTypes(args[0])
        if (!arg0BaseTypes) {
          return false
        }
        const includedBaseTypes = arg0BaseTypes.some((type) =>
          this.createElementTypes.includes(type)
        )
        if (!(this.createElementTypes.includes(arg0Type ?? '') || includedBaseTypes)) {
          const newNode = this.loggingFunction(
            propertyAccessExpression.getNameNode(),
            [],
            'Replace addChild with renderTree.createElement, you need to take care of the renderer'
          )
          return false
        }
      }
      parent.replaceWithText(
        `${leftSide.getText()}${propertyAccessExpression.hasQuestionDotToken() ? '?' : ''}.renderTree.createElement(${leftSide.getText()}, ${args[0].getText()})`
      )
      return true
    }
    return false
  }
}
