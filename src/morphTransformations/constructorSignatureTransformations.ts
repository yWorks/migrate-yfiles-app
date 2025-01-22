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
      else if (constructedClass === 'HierarchicLayout' && constructorArgs.length == 1) {
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
      else if ((constructedClass === 'DefaultLabelStyle' || constructedClass === 'MarkupLabelStyle' || constructedClass === 'WebGLLabelStyle') && constructorArgs.length ==1){
        const arg = constructorArgs[0]
        if (!arg.isKind(SyntaxKind.ObjectLiteralExpression)) {
          return
        }
        const clipTextPA = arg
          .getProperties()
          .find(
            (arg) =>
              arg.isKind(SyntaxKind.PropertyAssignment) && arg.getName() === 'clipText'
          ) as PropertyAssignment
        const wrappingPA = arg
          .getProperties()
          .find(
            (arg) =>
              arg.isKind(SyntaxKind.PropertyAssignment) && arg.getName() === 'wrapping'
          ) as PropertyAssignment
        // clip text defaults to true
        const clipTextVal = !clipTextPA || clipTextPA.getInitializer()?.getText() == 'true'
        const wrappingPAVal = !wrappingPA ? "'none'" : wrappingPA.getInitializer()?.getText()
        let replaceVal:string = ''
        if(wrappingPAVal && wrappingPAVal.includes('.')){
          if(wrappingPAVal == "TextWrapping.NONE"){
            if(clipTextVal){
              replaceVal = "TextWrapping.CLIP"
            }
          }
        }else{
          if(wrappingPAVal == "'none'"){
            if(clipTextVal){
            replaceVal = "'clip'"
            }
          }else{
            replaceVal = `'wrap-${wrappingPAVal?.replaceAll("'","")}'`
          }
        }
        if(replaceVal) {
          wrappingPA.replaceWithText(
            `wrapping: ${replaceVal}`
          )
        }
      }
    }
  }
}
