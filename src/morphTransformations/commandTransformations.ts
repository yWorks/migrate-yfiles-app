import { matchType, type ITransformation } from '../utils.js'
import {
  type CallExpression,
  type LeftHandSideExpression,
  type PropertyAccessExpression,
  type SourceFile,
  SyntaxKind
} from 'ts-morph'
import type { StatisticsReport } from '../statisticsReport.js'

export class CommandTransformation implements ITransformation {
  sourceFile: SourceFile
  statisticsReporting: StatisticsReport

  constructor(sourceFile: SourceFile, statisticsReporting: StatisticsReport) {
    this.sourceFile = sourceFile
    this.statisticsReporting = statisticsReporting
  }
  transform() {
    for (const callExpression of this.sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .reverse()) {
      const expression = callExpression.getExpression()
      if (expression.isKind(SyntaxKind.PropertyAccessExpression)) {
        const paeLeftSide = expression.getExpression()
        this.handleCommand(paeLeftSide, expression, callExpression)
      }
    }
    return
  }

  private handleCommand(
    paeLeftSide: LeftHandSideExpression,
    expression: PropertyAccessExpression,
    callExpression: CallExpression
  ) {
    if (matchType(paeLeftSide, 'ICommand')) {
      const paeRightSide = expression.getName()
      if (paeRightSide === 'canExecute' || paeRightSide === 'execute') {
        callExpression.replaceWithText(
          `${callExpression
            .getArguments()[1]
            .getText()}.${paeRightSide}Command(${paeLeftSide.getText()},${callExpression
            .getArguments()[0]
            .getText()})`
        )
        this.statisticsReporting.addChangeCount('commandTransformations', 1)
      }
    }
  }
}
