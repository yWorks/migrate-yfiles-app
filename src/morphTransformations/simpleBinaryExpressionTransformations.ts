import {
  checkIfYfiles,
  getDeclaringClass,
  getType,
  type ITransformation,
  matchType
} from '../utils.js'
import {
  type BinaryExpression,
  type Expression,
  Node,
  type PropertyAccessExpression,
  type SourceFile,
  SyntaxKind
} from 'ts-morph'
import type { StatisticsReport } from '../statisticsReport.js'
import type {} from 'typescript'

export class SimpleBinaryExpressionTransformations implements ITransformation {
  sourceFile: SourceFile
  statisticsReporting: StatisticsReport

  constructor(sourceFile: SourceFile, statisticsReporting: StatisticsReport) {
    this.sourceFile = sourceFile
    this.statisticsReporting = statisticsReporting
  }

  transform(): void {
    for (const binaryExpression of this.sourceFile
      .getDescendantsOfKind(SyntaxKind.BinaryExpression)
      .reverse()) {
      const leftSide = binaryExpression.getLeft()
      const operatorToken = binaryExpression.getOperatorToken()
      const rightSide = binaryExpression.getRight()
      if (leftSide.isKind(SyntaxKind.PropertyAccessExpression)) {
        const declaringClass = getDeclaringClass(leftSide)
        if (declaringClass && checkIfYfiles(declaringClass)) {
          if (
            this.checkLayout(declaringClass, leftSide, operatorToken, rightSide, binaryExpression)
          ) {
            continue
          }
        }
      }
    }
  }
  checkLayout(
    declaringClass: Node,
    leftSide: PropertyAccessExpression,
    operatorToken: Node,
    rightSide: Expression,
    binaryExpression: BinaryExpression
  ) {
    if (getType(declaringClass)?.includes('Layout')) {
      if (leftSide.getName() === 'recursiveGroupLayering' && rightSide.getText() === 'false') {
        binaryExpression.replaceWithText(
          `${leftSide.getExpression().getText()}.groupLayeringPolicy ${operatorToken.getText()} GroupLayeringPolicy.IGNORE_GROUPS`
        )
        this.statisticsReporting.addChangeCount('binaryExpressionTransformation', 1)
        return true
      }
      if (leftSide.getName() === 'layoutMode') {
        if (rightSide.getText() === 'LayoutMode.INCREMENTAL') {
          binaryExpression.replaceWithText(
            `${leftSide.getExpression().getText()}.fromSketchMode ${operatorToken.getText()} true`
          )
          this.statisticsReporting.addChangeCount('binaryExpressionTransformation', 1)
          return true
        }
        if (rightSide.getText() === 'LayoutMode.FROM_SCRATCH') {
          binaryExpression.replaceWithText(
            `${leftSide.getExpression().getText()}.fromSketchMode ${operatorToken.getText()} false`
          )
          this.statisticsReporting.addChangeCount('binaryExpressionTransformation', 1)
          return true
        }
      }
      if (leftSide.getName() === 'considerNodeLabels') {
        const radial = matchType(leftSide.getExpression(), 'BalloonLayout')
        const placement = radial ? 'RadialNodeLabelPlacement' : 'NodeLabelPlacement'
        if (rightSide.getText() === 'false') {
          binaryExpression.replaceWithText(
            `${leftSide.getExpression().getText()}.nodeLabelPlacement = ${placement}.IGNORE`
          )
          this.statisticsReporting.addChangeCount('binaryExpressionTransformation', 1)
          return true
        }
        if (rightSide.getText() === 'true') {
          binaryExpression.replaceWithText(
            `${leftSide.getExpression().getText()}.nodeLabelPlacement = ${placement}.CONSIDER`
          )
          this.statisticsReporting.addChangeCount('binaryExpressionTransformation', 1)
          return true
        }
      }
      if (leftSide.getName() === 'integratedEdgeLabeling') {
        if (rightSide.getText() === 'false') {
          binaryExpression.replaceWithText(
            `${leftSide.getExpression().getText()}.edgeLabelPlacement = EdgeLabelPlacement.IGNORE`
          )
          this.statisticsReporting.addChangeCount('binaryExpressionTransformation', 1)
          return true
        }
        if (rightSide.getText() === 'true') {
          binaryExpression.replaceWithText(
            `${leftSide.getExpression().getText()}.edgeLabelPlacement = EdgeLabelPlacement.INTEGRATED`
          )
          this.statisticsReporting.addChangeCount('binaryExpressionTransformation', 1)
          return true
        }
      }
      if (leftSide.getName() === 'maximumDuration') {
        if (rightSide.getText() === '0') {
          binaryExpression.replaceWithText(`${leftSide.getText()} = TimeSpan.MAX_VALUE`)
          this.statisticsReporting.addChangeCount('binaryExpressionTransformation', 1)
          return true
        }
      }
    }
    return false
  }
}
