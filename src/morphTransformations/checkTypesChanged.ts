import type { Changes } from '../types.js'
import { type PropertyAccessExpression, type SourceFile, SyntaxKind } from 'ts-morph'
import {
  checkIfYfiles,
  getDeclaringClass,
  getType,
  isExcluded,
  type ITransformation,
  type loggingFunction,
  returnTypeIsExcluded
} from '../utils.js'
import type { StatisticsReport } from '../statisticsReport.js'

/**
 * This function should annotate usages of changed (not just renamed) types.
 * This is to warn users that a corresponding API might be different and breaking
 */
export class TypesChangedTransformation implements ITransformation {
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

  transform(): void {
    for (const propertyAccessExpression of this.sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAccessExpression
    )) {
      const declaringClass = getDeclaringClass(propertyAccessExpression)
      const declaringClassType = getType(declaringClass)
      if (
        !declaringClassType ||
        !declaringClass ||
        (declaringClass && !checkIfYfiles(declaringClass))
      ) {
        continue
      }
      //check propertyTypesChanged
      if (this.checkPropertyTypesChanged(propertyAccessExpression, declaringClassType)) {
        continue
      }
      //check returnTypesChanged
      if (this.checkReturnTypesChanged(propertyAccessExpression, declaringClassType)) {
        continue
      }

      return
    }
  }
  private checkPropertyTypesChanged(
    propertyAccessExpression: PropertyAccessExpression,
    declaringClassType: string
  ) {
    const expressionTypeText = getType(propertyAccessExpression.getExpression())
    const paeName = propertyAccessExpression.getName()
    const nameNode = propertyAccessExpression.getNameNode()
    if (
      expressionTypeText &&
      Object.hasOwn(this.changes.propertyTypesChanged, declaringClassType) &&
      Object.hasOwn(this.changes.propertyTypesChanged[declaringClassType], paeName)
    ) {
      const paeParent = propertyAccessExpression.getParent()
      const newType = this.changes.propertyTypesChanged[declaringClassType][paeName]
      //check if new type is just a renaming then we do not log a message
      if (
        Object.values(this.changes.typesRenamed).includes(newType) ||
        (paeParent && (isExcluded(getType(paeParent) ?? null) || isExcluded(`${declaringClassType}.${paeName}`)))
      ) {
        return false
      }
      this.loggingFunction(
        nameNode,
        [paeName, expressionTypeText, getType(nameNode) ?? '', newType],
        `Possible breaking change: Type of #insert0# on #insert1# has changed from #insert2# to #insert3#`
      )
      this.statisticsReporting.addChangeCount('propertyTypesChanged', 1)
      return true
    }
    return false
  }

  private checkReturnTypesChanged(
    propertyAccessExpression: PropertyAccessExpression,
    declaringClassType: string
  ) {
    const paeName = propertyAccessExpression.getName()
    const nameNode = propertyAccessExpression.getNameNode()
    if (
      Object.hasOwn(this.changes.returnTypesChanged, declaringClassType) &&
      Object.hasOwn(this.changes.returnTypesChanged[declaringClassType], paeName)
    ) {
      const newType = this.changes.returnTypesChanged[declaringClassType][paeName]
      //check if new type is just a renaming then we do not log a message
      if (
        Object.values(this.changes.typesRenamed).includes(newType) ||
        returnTypeIsExcluded(nameNode)
      ) {
        return false
      }
      this.loggingFunction(
        nameNode,
        [paeName, newType],
        `Possible breaking change: Return Type from method #insert0# has changed to #insert1#`
      )
      this.statisticsReporting.addChangeCount('returnTypesChanged', 1)
      return true
    }
    return false
  }
}
