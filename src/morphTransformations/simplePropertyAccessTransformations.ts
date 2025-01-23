import { checkIfYfiles, matchType, type ITransformation, getDeclaringClass, loggingFunction } from '../utils.js'
import {
  type LeftHandSideExpression,
  Node,
  type PropertyAccessExpression,
  type SourceFile,
  SyntaxKind,
  ts
} from 'ts-morph'
import type { StatisticsReport } from '../statisticsReport.js'

export class SimplePropertyAccessTransformations implements ITransformation {
  sourceFile: SourceFile
  statisticsReporting: StatisticsReport
  loggingFunction: loggingFunction

  constructor(sourceFile: SourceFile, statisticsReporting: StatisticsReport, loggingFunction: loggingFunction) {
    this.sourceFile = sourceFile
    this.statisticsReporting = statisticsReporting
    this.loggingFunction = loggingFunction
  }

  transform() {
    const unAppliedTransforms: (() => Node<ts.Node>)[] = []
    for (const propertyAccessExpression of this.sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAccessExpression
    )) {
      const rightSide = propertyAccessExpression.getName()
      const declaringClass = getDeclaringClass(propertyAccessExpression)

      const leftSide = propertyAccessExpression.getExpression()
      if (declaringClass && checkIfYfiles(declaringClass)) {
        if (
          this.checkDollarClass(
            declaringClass,
            rightSide,
            propertyAccessExpression,
            leftSide,
            unAppliedTransforms
          )
        ) {
          continue
        }
        if (
          this.graphPropertyAccess(
            declaringClass,
            rightSide,
            propertyAccessExpression,
            leftSide,
            unAppliedTransforms
          )
        ) {
          continue
        }
        if (
          this.incrementalHints(
            declaringClass,
            rightSide,
            propertyAccessExpression,
            leftSide,
            unAppliedTransforms
          )
        ) {
          continue
        }
        if (
          this.lineSegmentHorizontalVertical(
            declaringClass,
            rightSide,
            propertyAccessExpression,
            leftSide,
            unAppliedTransforms
          )
        ) {
          continue
        }
        if (
          this.labelEditingEventArgs(
            declaringClass,
            rightSide,
            propertyAccessExpression,
            leftSide,
            unAppliedTransforms
          )
        ) {
          continue
        }
        if (
          this.arrowTransformations(
            declaringClass,
            rightSide,
            propertyAccessExpression,
            leftSide,
            unAppliedTransforms
          )
        ) {
          continue
        }
        if (this.orientedRectangleAngle(declaringClass, rightSide, propertyAccessExpression, leftSide, unAppliedTransforms)) {
          continue
        }
      }
    }
    for (const fn of unAppliedTransforms) {
      fn()
    }
    return
  }

  private checkDollarClass(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    unAppliedTransforms: (() => Node<ts.Node>)[]
  ) {
    if (rightSide === '$class') {
      unAppliedTransforms.push(() => propertyAccessExpression.replaceWithText(leftSide.getText()))
      this.statisticsReporting.addChangeCount('propertyAccessTransformation', 1)
      return true
    }
  }

  private incrementalHints(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    unAppliedTransforms: (() => Node<ts.Node>)[]
  ) {
    if (leftSide.isKind(SyntaxKind.PropertyAccessExpression)) {
      const expressionDeclaringClass = getDeclaringClass(leftSide)
      if (
        expressionDeclaringClass &&
        checkIfYfiles(expressionDeclaringClass) &&
        matchType(expressionDeclaringClass, 'HierarchicLayoutData') &&
        leftSide.getName() === 'incrementalHints'
      ) {
        if (rightSide === 'incrementalLayeringNodes') {
          unAppliedTransforms.push(() =>
            propertyAccessExpression.replaceWithText(
              `${leftSide.getExpression().getText()}.incrementalNodes`
            )
          )
          this.statisticsReporting.addChangeCount('propertyAccessTransformation', 1)
          return true
        }

        if (rightSide === 'incrementalSequencingItems') {
          unAppliedTransforms.push(() =>
            propertyAccessExpression.replaceWithText(
              `${leftSide.getExpression().getText()}.incrementalEdges`
            )
          )
          this.statisticsReporting.addChangeCount('propertyAccessTransformation', 1)
          return true
        }
      }
    }
  }

  private graphPropertyAccess(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    unAppliedTransforms: (() => Node<ts.Node>)[]
  ) {
    if (matchType(declaringClass, 'Graph')) {
      if (rightSide === 'nodeCount' || rightSide === 'n') {
        unAppliedTransforms.push(() =>
          propertyAccessExpression.replaceWithText(`${leftSide.getText()}.nodes.size`)
        )
        this.statisticsReporting.addChangeCount('propertyAccessTransformation', 1)
        return true
      } else if (rightSide === 'edgeCount' || rightSide === 'e') {
        unAppliedTransforms.push(() =>
          propertyAccessExpression.replaceWithText(`${leftSide.getText()}.edges.size`)
        )
        this.statisticsReporting.addChangeCount('propertyAccessTransformation', 1)
        return true
      } else if (rightSide === 'empty') {
        unAppliedTransforms.push(() =>
          propertyAccessExpression.replaceWithText(`${leftSide.getText()}.isEmpty`)
        )
        this.statisticsReporting.addChangeCount('propertyAccessTransformation', 1)
      }
    }
  }

  private lineSegmentHorizontalVertical(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    unAppliedTransforms: (() => Node<ts.Node>)[]
  ) {
    if (matchType(declaringClass, 'LineSegment')) {
      if (rightSide === 'isHorizontal' || rightSide === 'isVertical') {
        unAppliedTransforms.push(() =>
          propertyAccessExpression.replaceWithText(`${propertyAccessExpression.getText()}()`)
        )
        this.statisticsReporting.addChangeCount('propertyAccessTransformation', 1)
        return true
      }
    }
  }

  private labelEditingEventArgs(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    unAppliedTransforms: (() => Node<ts.Node>)[]
  ) {
    if (matchType(declaringClass, 'LabelEditingEventArgs')) {
      if (rightSide === 'owner') {
        unAppliedTransforms.push(() =>
          propertyAccessExpression.replaceWithText(`${leftSide.getText()}.item.owner`)
        )
        this.statisticsReporting.addChangeCount('propertyAccessTransformation', 1)
        return true
      }
    }
  }

  private arrowTransformations(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    unAppliedTransforms: (() => Node<ts.Node>)[]
  ) {
    const arrowMap: Record<string, string> = {
      NONE: 'NONE',
      CROSS: 'CROSS',
      DIAMOND: 'DIAMOND',
      CIRCLE: 'ELLIPSE',
      SIMPLE: 'OPEN',
      DEFAULT: 'STEALTH',
      SHORT: 'STEALTH',
      TRIANGLE: 'TRIANGLE'
    }
    if (matchType(declaringClass, 'IArrow')) {
      if (Object.hasOwn(arrowMap, rightSide)) {
        unAppliedTransforms.push(() =>
          propertyAccessExpression.replaceWithText(`new Arrow(ArrowType.${arrowMap[rightSide]})`)
        )
        this.statisticsReporting.addChangeCount('propertyAccessTransformation', 1)
        return true
      }
    }
  }

  private orientedRectangleAngle(
    declaringClass: Node,
    rightSide: string,
    propertyAccessExpression: PropertyAccessExpression,
    leftSide: LeftHandSideExpression,
    unAppliedTransforms: (() => Node<ts.Node>)[]
  ) {
    if (matchType(declaringClass, 'OrientedRectangle')) {
      if (rightSide === 'angle') {
        unAppliedTransforms.push(() =>
          this.loggingFunction(propertyAccessExpression, [], 'Rotation for angle has changed negate the angle and check the resulting visual')
        )
        this.statisticsReporting.addChangeCount('propertyAccessTransformation', 1)
        return true
      }
    }
  }
}
