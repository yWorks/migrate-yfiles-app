import { matchType, type ITransformation, replaceWithTextTryCatch, loggingFunction } from '../utils.js'
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
  loggingFunction: loggingFunction

  constructor(sourceFile: SourceFile, statisticsReporting: StatisticsReport, loggingFunction: loggingFunction) {
    this.sourceFile = sourceFile
    this.statisticsReporting = statisticsReporting
    this.loggingFunction = loggingFunction
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
        if (callExpression.getArguments().length == 2 && !matchType(callExpression.getArguments()[1], 'null')) {
          replaceWithTextTryCatch(callExpression,
            `${callExpression
              .getArguments()[1]
              .getText()}.${paeRightSide}Command(${paeLeftSide.getText()},${callExpression
              .getArguments()[0]
              .getText()})`
          )
          this.statisticsReporting.addChangeCount('commandTransformations', 1)
        } else {
          this.loggingFunction(callExpression,[null],'ICommand has been removed. See https://docs.yworks.com/yfileshtml/#/dguide/customizing_concepts_commands.')
        }
      }
    }
  }
}
