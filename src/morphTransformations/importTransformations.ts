import { ImportSpecifier, type SourceFile } from 'ts-morph'
import type { Changes } from '../types.js'
import { ITransformation, ITransformFunction, replaceWithTextTryCatch } from '../utils.js'
import type { StatisticsReport } from '../statisticsReport.js'

export class ImportTransformations implements ITransformation {
  sourceFile: SourceFile
  changes: Changes
  wrappedTransform: ITransformation
  statisticsReporting: StatisticsReport

  constructor(
    sourceFile: SourceFile,
    changes: Changes,
    wrappedTransform: ITransformation,
    statisticsReporting: StatisticsReport
  ) {
    this.sourceFile = sourceFile
    this.changes = changes
    this.wrappedTransform = wrappedTransform
    this.statisticsReporting = statisticsReporting
  }
  /**
   * Process imports: Remove no longer existing types and duplicates created by previous renames
   */
  transform() {
    const importDeclarations = this.sourceFile.getImportDeclarations()
    for (const importDeclaration of importDeclarations) {
      if (!importDeclaration.getModuleSpecifier().getLiteralValue().includes('yfiles')) {
        continue
      }

      const seenNamedImports = new Set<string>()
      for (const namedImport of importDeclaration.getNamedImports()) {
        this.handleImport(namedImport, seenNamedImports)
      }
      replaceWithTextTryCatch(importDeclaration.getModuleSpecifier(), "'@yfiles/yfiles'")
    }
    return
  }

  private handleImport(namedImport: ImportSpecifier, seenNamedImports: Set<string>) {
    let name
    this.wrappedTransform.transform(namedImport.getNameNode())
    // re-assign name in case it was transformed
    name = namedImport.getName()
    if (Object.keys(this.changes.typesRemoved).includes(name) || seenNamedImports.has(name)) {
      namedImport.remove()
      this.statisticsReporting.addChangeCount('importTransformations', 1)
    }

    seenNamedImports.add(name)
  }
}
