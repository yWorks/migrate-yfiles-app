import { checkIfYfiles, type ITransformation } from '../utils.js'
import { type PropertyAssignment, type SourceFile, SyntaxKind } from 'ts-morph'
import type { StatisticsReport } from '../statisticsReport.js'

export class ConstructorSignatureTransformations implements ITransformation {
  sourceFile: SourceFile
  statisticsReporting: StatisticsReport

  constructor(sourceFile: SourceFile, statisticsReporting: StatisticsReport) {
    this.sourceFile = sourceFile
    this.statisticsReporting = statisticsReporting
  }

  transform(): void {
    for (const newExpression of this.sourceFile
      .getDescendantsOfKind(SyntaxKind.NewExpression)
      .reverse()) {
      const constructedClass = newExpression.getExpression().getText()
      const constructorArgs = newExpression.getArguments()
      if (!checkIfYfiles(newExpression)) {
        continue
      }
      if (constructedClass === 'Insets' && constructorArgs.length == 4) {
        const argText = constructorArgs.map((arg) => arg.getText())
        constructorArgs.forEach((arg) => {
          newExpression.removeArgument(arg)
        })
        const newInsets = `{top: ${argText[1]}, right: ${argText[2]}, bottom: ${argText[3]}, left: ${argText[0]}}`
        newExpression.replaceWithText(`Insets.from(${newInsets})`)
        this.statisticsReporting.addChangeCount('constructorSignatureTransformation', 1)
      }
      if (constructedClass === 'HierarchicLayout' && constructorArgs.length == 1) {
        const arg = constructorArgs[0]
        if (!arg.isKind(SyntaxKind.ObjectLiteralExpression)) {
          return
        }
        const considerNodeLabels = arg
          .getProperties()
          .find(
            (arg) =>
              arg.isKind(SyntaxKind.PropertyAssignment) && arg.getName() === 'considerNodeLabels'
          ) as PropertyAssignment
        if (considerNodeLabels) {
          const initializer = considerNodeLabels.getInitializer()?.getText()
          if (initializer) {
            considerNodeLabels.replaceWithText(
              `nodeLabelPlacement: NodeLabelPlacement.${initializer === 'true' ? 'CONSIDER' : 'IGNORE'}`
            )
          }
        }
      }
    }
  }
}
