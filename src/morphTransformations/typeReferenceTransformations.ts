import { type ITransformation, replaceWithTextTryCatch } from '../utils.js'
import { type SourceFile, SyntaxKind } from 'ts-morph'
import type { StatisticsReport } from '../statisticsReport.js'

export class TypeReferenceTransformations implements ITransformation {
  sourceFile: SourceFile
  statisticsReporting: StatisticsReport
  typeReferenceRenamings: Record<string, string> = { Class: 'Constructor' }
  constructor(sourceFile: SourceFile, statisticsReporting: StatisticsReport) {
    this.sourceFile = sourceFile
    this.statisticsReporting = statisticsReporting
  }
  transform(): void {
    for (const typeReference of this.sourceFile
      .getDescendantsOfKind(SyntaxKind.TypeReference)
      .reverse()) {
      const refName = typeReference.getTypeName().getText()
      if (Object.hasOwn(this.typeReferenceRenamings, refName)) {
        replaceWithTextTryCatch(typeReference.getTypeName(), this.typeReferenceRenamings[refName])
        this.statisticsReporting.addChangeCount('typeReferenceTransformation', 1)
      }
    }
  }
}
