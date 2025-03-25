import { checkIfYfiles, getDeclaringClass, type ITransformation, matchType, replaceWithTextTryCatch } from '../utils.js'
import {
  type CallExpression,
  type LeftHandSideExpression,
  Node,
  type PropertyAccessExpression,
  type SourceFile,
  type Statement,
  ts
} from 'ts-morph'
import type { StatisticsReport } from '../statisticsReport.js'
import SyntaxKind = ts.SyntaxKind

export class SimpleCallExpressionTransformations implements ITransformation {
  sourceFile: SourceFile
  statisticsReporting: StatisticsReport
  positionSets = ['setCenter']

  constructor(sourceFile: SourceFile, statisticsReporting: StatisticsReport) {
    this.sourceFile = sourceFile
    this.statisticsReporting = statisticsReporting
  }

  transform(): void {
    for (const callExpression of this.sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .reverse()) {
      const expression = callExpression.getExpression()
      if (expression.isKind(SyntaxKind.PropertyAccessExpression)) {
        const declaringClass = getDeclaringClass(expression)
        const leftHand = expression.getExpression()
        if (declaringClass && checkIfYfiles(declaringClass)) {
          const rightHand = expression.getName()
          if (this.checkEnsure(declaringClass, leftHand, callExpression)) {
            continue
          }
          if (this.checkSizefrom(declaringClass, rightHand, expression, leftHand, callExpression)) {
            continue
          }
          if (
            this.getDataProvider(declaringClass, rightHand, expression, leftHand, callExpression)
          ) {
            continue
          }
          if (
            this.addDataProvider(declaringClass, rightHand, expression, leftHand, callExpression)
          ) {
            continue
          }
          if (
            this.removeDataProvider(declaringClass, rightHand, expression, leftHand, callExpression)
          ) {
            continue
          }
          if (this.gmmSetStyle(declaringClass, rightHand, expression, leftHand, callExpression)) {
            continue
          }
          if (
            this.selectionAddRemove(declaringClass, rightHand, expression, leftHand, callExpression)
          ) {
            continue
          }
          if (
            this.labelModelDefaultParameter(declaringClass, rightHand, leftHand, callExpression)
          ) {
            continue
          }
          if (
            this.isInstanceToInstanceOf(
              declaringClass,
              rightHand,
              expression,
              leftHand,
              callExpression
            )
          ) {
            continue
          }
          if (
            this.createParameterConvertibles(
              declaringClass,
              rightHand,
              expression,
              leftHand,
              callExpression
            )
          ) {
            continue
          }
          if (
            this.highlightIndicatorManager(
              declaringClass,
              rightHand,
              expression,
              leftHand,
              callExpression
            )
          ) {
            continue
          }
          if (
            this.layoutGraphSetterGetter(
              declaringClass,
              rightHand,
              expression,
              leftHand,
              callExpression
            )
          ) {
            continue
          }
        }
      }
    }
  }

  private checkSizefrom(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (
      (rightSide === 'from' || rightSide === 'convertFrom') &&
      matchType(declaringClass, 'Size')
    ) {
      const parent = propertyAccessExpression.getParent()
      if (parent && parent.isKind(SyntaxKind.CallExpression)) {
        const callArgs: string[] = parent.getArguments().map((arg) => arg.getText())
        const newText = `new Size(${callArgs.join(', ')})`
        replaceWithTextTryCatch(callExpression, newText)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      }
    }
  }

  private getDataProvider(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (rightSide === 'getDataProvider' && matchType(declaringClass, 'Graph')) {
      const arg = callExpression.getArguments()[0]
      replaceWithTextTryCatch(callExpression, `${leftSide.getText()}.context.getItemData(${arg.getText()})`)
      this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
      return true
    }
  }

  private addDataProvider(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (rightSide === 'addDataProvider' && matchType(declaringClass, 'Graph')) {
      const arg1 = callExpression.getArguments()[0]
      const arg2 = callExpression.getArguments()[1]
      replaceWithTextTryCatch(callExpression,
        `${leftSide.getText()}.context.addItemData(${arg1.getText()}, ${arg2.getText()})`
      )
      this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
      return true
    }
  }

  private gmmSetStyle(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (rightSide == 'setStyle' && matchType(declaringClass, 'GraphModelManager')) {
      const arg1 = callExpression.getArguments()[0]
      const arg2 = callExpression.getArguments()[1]
      replaceWithTextTryCatch(callExpression,
        `${leftSide.getText()}.graph.setStyle(${arg1.getText()}, ${arg2.getText()})`
      )
      this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
      return true
    }
  }

  private removeDataProvider(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (rightSide === 'removeDataProvider' && matchType(declaringClass, 'Graph')) {
      const arg = callExpression.getArguments()[0]
      replaceWithTextTryCatch(callExpression, `${leftSide.getText()}.context.remove(${arg.getText()})`)
      this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
      return true
    }
  }

  private checkEnsure(
    declaringClass: Node,
    leftHand: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (matchType(declaringClass, 'Class')) {
      const expression = callExpression.getExpression()
      if (callExpression.getArguments()[0].getText() === 'LayoutExecutor') {
        replaceWithTextTryCatch(callExpression, 'LayoutExecutor.ensure()')
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (expression.isKind(SyntaxKind.PropertyAccessExpression) && (expression.getName() === 'ensure' || expression.getName() === 'fixType')) {
        if (Node.isStatement(callExpression.getParent())) {
          ;(callExpression.getParent() as Statement).remove()
          this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
          return true
        }
      }
    }
  }

  private selectionAddRemove(
    declaringClass: Node,
    rightHand: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftHand: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (
      matchType(declaringClass, 'ISelectionModel<T>') &&
      propertyAccessExpression.getName() === 'setSelected'
    ) {
      const arg1 = callExpression.getArguments()[0]
      const arg2 = callExpression.getArguments()[1]
      const addRemove = arg2.getText() === 'true' ? 'add' : 'remove'
      replaceWithTextTryCatch(callExpression, `${leftHand.getText()}.${addRemove}(${arg1.getText()})`)
      this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
      return true
    }
  }

  private isInstanceToInstanceOf(
    declaringClass: Node,
    rightHand: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftHand: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (propertyAccessExpression.getName() === 'isInstance') {
      const arg1 = callExpression.getArguments()[0]
      replaceWithTextTryCatch(callExpression, `(${arg1.getText()} instanceof ${leftHand.getText()})`)

      this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
      return true
    }
  }

  private createParameterConvertibles(
    declaringClass: Node,
    rightHand: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftHand: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (propertyAccessExpression.getName() === 'createParameter') {
      const mapping: Record<string, string> = {
        '\'north\'': '\'top\'',
        '\'south\'': '\'bottom\'',
        '\'west\'': '\'left\'',
        '\'east\'': '\'right\''
      }
      const arg1 = callExpression.getArguments()[0]
      if (Object.hasOwn(mapping, arg1.getText())) {
        replaceWithTextTryCatch(arg1, `${mapping[arg1.getText()]}`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      }
    }
  }

  private highlightIndicatorManager(
    declaringClass: Node,
    rightHand: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftHand: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (matchType(declaringClass, 'HighlightIndicatorManager<IModelItem>')) {
      if (rightHand === 'clearHighlights') {
        replaceWithTextTryCatch(callExpression, `${leftHand.getText()}.items?.clear()`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (rightHand === 'addHighlight') {
        const arg = callExpression.getArguments()[0]
        replaceWithTextTryCatch(callExpression, `${leftHand.getText()}.items?.add(${arg.getText()})`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (rightHand === 'removeHighlight') {
        const arg = callExpression.getArguments()[0]
        replaceWithTextTryCatch(callExpression, `${leftHand.getText()}.items?.remove(${arg.getText()})`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      }
    }
  }

  private layoutGraphSetterGetter(
    declaringClass: Node,
    rightHand: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftHand: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    const propsMap: Record<string, string> = {
      getBoundingBox: 'layout.bounds',
      getCenter: 'layout.center',
      getCenterX: 'layout.centerX',
      getCenterY: 'layout.centerY',
      getHeight: 'layout.height',
      getWidth: 'layout.width',
      getLocation: 'layout.topLeft',
      getSize: 'layout.size',
      getLayout: 'layout'
    }
    if (matchType(declaringClass, 'LayoutGraph')) {
      const parent = callExpression.getParent()
      if (parent && rightHand === 'setSize' && parent.isKind(SyntaxKind.ExpressionStatement)) {
        const args = callExpression.getArguments()
        if (args.length == 3) {
          const arg1 = args[0].getText()
          const arg2 = args[1].getText()
          const arg3 = args[2].getText()
          replaceWithTextTryCatch(parent, `${arg1}.layout.width = ${arg2}\n${arg1}.layout.height = ${arg3}`)
          this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        } else if (args.length == 2) {
          const arg1 = args[0].getText()
          const arg2 = args[1].getText()
          replaceWithTextTryCatch(parent,
            `${arg1}.layout.width = ${arg2}.width\n${arg1}.layout.height = ${arg2}.height`
          )
        } else {
          return false
        }
        return true
      } else if (
        parent &&
        rightHand === 'setCenter' &&
        parent.isKind(SyntaxKind.ExpressionStatement)
      ) {
        const args = callExpression.getArguments()
        if (args.length == 3) {
          const arg1 = args[0].getText()
          const arg2 = args[1].getText()
          const arg3 = args[2].getText()
          replaceWithTextTryCatch(parent, `${arg1}.layout.center = new Point(${arg2},${arg3})`)
          this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        } else if (args.length == 2) {
          const arg1 = args[0].getText()
          const arg2 = args[1].getText()
          replaceWithTextTryCatch(parent, `${arg1}.layout.center = ${arg2}`)
        } else {
          return false
        }
        return true
      } else if (
        parent &&
        rightHand === 'setLocation' &&
        parent.isKind(SyntaxKind.ExpressionStatement)
      ) {
        const args = callExpression.getArguments()
        if (args.length == 3) {
          const arg1 = args[0].getText()
          const arg2 = args[1].getText()
          const arg3 = args[2].getText()
          replaceWithTextTryCatch(parent, `${arg1}.layout.topLeft = new Point(${arg2},${arg3})`)
          this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        } else if (args.length == 2) {
          const arg1 = args[0].getText()
          const arg2 = args[1].getText()
          replaceWithTextTryCatch(parent, `${arg1}.layout.topLeft = ${arg2}`)
        } else {
          return false
        }
        return true
      } else if (Object.keys(propsMap).includes(rightHand)) {
        const args = callExpression.getArguments()
        if (args.length == 1) {
          replaceWithTextTryCatch(callExpression, `${args[0].getText()}.${propsMap[rightHand]}`)
          this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        }
      }
    }
  }

  private labelModelDefaultParameter(
    declaringClass: Node,
    rightHand: string,
    leftHand: LeftHandSideExpression,
    callExpression: CallExpression
  ) {
    if (rightHand === 'createDefaultParameter') {
      const leftHandInternal = leftHand.isKind(SyntaxKind.PropertyAccessExpression)
        ? leftHand.getExpression()
        : leftHand
      if (matchType(leftHandInternal, 'CompositeLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.parameters.first()`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'GenericLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.parameters.first()`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'InteriorNodeLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.CENTER`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'StripeLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.TOP`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'StretchStripeLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.TOP`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'SmartEdgeLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.createParameterFromSource(0)`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'SandwichLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.BOTTOM`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'NinePositionsEdgeLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.CENTER_CENTERED`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'InsideOutsidePortLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.createOutsideParameter()`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'GroupNodeLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.createTabParameter()`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'FreePortLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.CENTER`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'FreeLabelModel')) {
        replaceWithTextTryCatch(callExpression,
          `${leftHandInternal.getText()}.createAbsolute(Point.ORIGIN, 0)`
        )
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'FreeNodeLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.CENTER`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'FreeEdgeLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.createParameter()`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'ExteriorNodeLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.TOP`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'EdgeSegmentLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.createParameterFromSource(0)`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'EdgePathLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.createRatioParameter()`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'BezierEdgeSegmentLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.createParameterFromSource(0)`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      } else if (matchType(leftHandInternal, 'BezierEdgePathLabelModel')) {
        replaceWithTextTryCatch(callExpression, `${leftHandInternal.getText()}.createParameter(0.5)`)
        this.statisticsReporting.addChangeCount('simpleCallExpressionTransformation', 1)
        return true
      }
      //todo all other label models here
    }
  }
}
