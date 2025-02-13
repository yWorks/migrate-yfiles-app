import { Identifier, type SourceFile } from 'ts-morph'
import type { Changes } from '../types.js'
import { isExcluded, type ITransformation, type loggingFunction, replaceWithTextTryCatch } from '../utils.js'
import type { StatisticsReport } from '../statisticsReport.js'

export class TypesRenamedTransformations implements ITransformation {
  sourceFile: SourceFile
  changes: Changes
  loggingFunction: loggingFunction
  statisticsReporting: StatisticsReport

  constructor(
    sourceFile: SourceFile,
    changes: Changes,
    loggingFunction: loggingFunction,
    statisticsReporting: StatisticsReport
  ) {
    this.sourceFile = sourceFile
    this.changes = changes
    this.loggingFunction = loggingFunction
    this.statisticsReporting = statisticsReporting
  }

  transform(): void
  transform(identifier: Identifier): void
  transform(identifier?: Identifier): void {
    if (identifier) {
      const name = identifier?.getText()
      if (Object.hasOwn(this.changes.typesRenamed, name)) {
        replaceWithTextTryCatch(identifier, this.changes.typesRenamed[name])
        this.statisticsReporting.addChangeCount('typesRenamed', 1)
      }
    }
  }
}

// if types are functionally required but have been removed with their functionality now
// found in other concepts warn the user and TODO point to a KB article (or similar)
export class TypesRemovedTransformations implements ITransformation {
  sourceFile: SourceFile
  changes: Changes
  loggingFunction: loggingFunction
  statisticsReporting: StatisticsReport

  constructor(
    sourceFile: SourceFile,
    changes: Changes,
    loggingFunction: loggingFunction,
    statisticsReporting: StatisticsReport
  ) {
    this.sourceFile = sourceFile
    this.changes = changes
    this.loggingFunction = loggingFunction
    this.statisticsReporting = statisticsReporting
  }

  transform(): void
  transform(identifier: Identifier): void
  transform(identifier?: Identifier): void {
    if (identifier) {
      const name = identifier?.getText()
      if (Object.keys(this.changes.typesRemoved).includes(name) && !isExcluded(name)) {
        this.loggingFunction(
          identifier,
          [identifier.getText()],
          '#insert0# has been removed',
          this.changes.typesRemoved?.[identifier.getText()]
        )
        this.statisticsReporting.addChangeCount('typesRemoved', 1)
      }
    }
  }
}
