import { getType, type ITransformation, replaceWithTextTryCatch } from '../utils.js'
import {
  ExpressionWithTypeArguments,
  type MethodDeclaration,
  type SourceFile,
  SyntaxKind
} from 'ts-morph'
import type { StatisticsReport } from '../statisticsReport.js'
import type { Changes } from '../types.js'

export class MethodTransformations implements ITransformation {
  sourceFile: SourceFile
  statisticsReporting: StatisticsReport
  changes: Changes

  constructor(sourceFile: SourceFile, changes: Changes, statisticsReporting: StatisticsReport) {
    this.sourceFile = sourceFile
    this.changes = changes
    this.statisticsReporting = statisticsReporting
  }

  hasRenamedMembers(extensions: ExpressionWithTypeArguments) {
    const classType = getType(extensions.getExpression())
    if (classType && Object.hasOwn(this.changes.membersRenamed, classType)) {
      return classType
    }
    return false
  }

  renameMethod(method: MethodDeclaration, mappings: Record<string, string>) {
    const methodName = method.getName()
    if (Object.hasOwn(mappings, methodName)) {
      replaceWithTextTryCatch(method.getNameNode(), mappings[methodName])
      this.statisticsReporting.addChangeCount('methodTransformations', 1)
    }
  }

  transform() {
    for (const classDeclaration of this.sourceFile
      .getDescendantsOfKind(SyntaxKind.ClassDeclaration)
      .reverse()) {
      const classExtensions = classDeclaration.getExtends()
      if (!classExtensions) {
        continue
      }
      const classWithRenamedMembers = this.hasRenamedMembers(classExtensions)
      if (classWithRenamedMembers) {
        const classMethods = classDeclaration.getMethods()
        for (const classMethod of classMethods) {
          this.renameMethod(classMethod, this.changes.membersRenamed[classWithRenamedMembers])
        }
      }
    }
  }
}
