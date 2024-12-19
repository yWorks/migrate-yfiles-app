import {
  Identifier,
  type PropertyAccessExpression,
  type SourceFile,
  SyntaxKind,
  ts
} from 'ts-morph'
import { checkIfYfiles, type ITransformation } from '../utils.js'
import type { StatisticsReport } from '../statisticsReport.js'

export class EnumTransformations implements ITransformation {
  sourceFile: SourceFile
  statisticsReporting: StatisticsReport

  constructor(sourceFile: SourceFile, statisticsReporting: StatisticsReport) {
    this.sourceFile = sourceFile
    this.statisticsReporting = statisticsReporting
  }

  transform(): void {
    for (const propertyAccessExpression of this.sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAccessExpression
    )) {
      const expression = propertyAccessExpression.getExpression()
      if (!checkIfYfiles(expression)) {
        continue
      }
      const enumName = propertyAccessExpression.getExpression().getSymbol()?.getName()
      this.checkFontWeight(enumName, propertyAccessExpression)
    }
  }

  private checkFontWeight(
    enumName: string | undefined,
    accessExpression: PropertyAccessExpression
  ) {
    if (enumName && enumName === 'FontWeight') {
      const stringText = accessExpression.getName().replace('ITEM', '').toLowerCase()
      accessExpression.replaceWithText(`'${stringText}'`)
      this.statisticsReporting.addChangeCount('enumTransformation', 1)
    }
  }
}
