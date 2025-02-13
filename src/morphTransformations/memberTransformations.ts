import {
  Identifier,
  type PropertyAccessExpression,
  type SourceFile,
  SyntaxKind,
  Node,
  ts
} from 'ts-morph'
import type { Changes } from '../types.js'
import {
  checkIfYfiles,
  compareSignature,
  getDeclaringClass,
  getType,
  isExcluded,
  type ITransformation,
  type loggingFunction, replaceWithTextTryCatch
} from '../utils.js'
import type { StatisticsReport } from '../statisticsReport.js'

export class MemberTransformations implements ITransformation {
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
    const unAppliedTransforms: (() => Node<ts.Node>)[] = []
    for (const propertyAccessExpression of this.sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAccessExpression
    )) {
      const declaringClass = getDeclaringClass(propertyAccessExpression)
      const declaringClassTypeText = getType(declaringClass)
      if (!declaringClassTypeText || !declaringClass || !checkIfYfiles(declaringClass)) {
        continue
      }
      const memberName = propertyAccessExpression.getName()
      const memberNameNode = propertyAccessExpression.getNameNode()
      if (
        this.checkRenamed(
          declaringClassTypeText,
          memberName,
          propertyAccessExpression,
          unAppliedTransforms
        )
      ) {
        continue
      }
      //exclusions should be mentioned in full "class.method"
      if (isExcluded(`${declaringClassTypeText}.${memberName}`)) {
        continue
      }
      this.checkObsolete(
        propertyAccessExpression,
        declaringClassTypeText,
        memberName,
        memberNameNode,
        unAppliedTransforms
      )

      // if members are functionally required but have been removed with their functionality now
      // found in other concepts warn the user and  point to a KB article (or similar)
      this.checkRemoved(declaringClassTypeText, memberName, memberNameNode, unAppliedTransforms)
    }
    for (const fn of unAppliedTransforms) {
      fn()
    }
  }

  private checkRenamed(
    declaringClassTypeText: string,
    memberName: string,
    parent: PropertyAccessExpression,
    unappliedTransforms: (() => Node)[]
  ): boolean {
    if (Object.hasOwn(this.changes.membersRenamed, declaringClassTypeText)) {
      const matchingSignature = Object.keys(
        this.changes.membersRenamed[declaringClassTypeText]
      ).find((signature) =>
        compareSignature(signature, memberName, this.changes.typesRenamedInverse)
      )
      if (matchingSignature) {
        const matchedValue = this.changes.membersRenamed[declaringClassTypeText][matchingSignature]
        const replaceText = matchedValue.split('(')[0]
        unappliedTransforms.push(() => replaceWithTextTryCatch(parent.getNameNode(), replaceText))
        this.statisticsReporting.addChangeCount('membersRenamed', 1)
        return true
      }
    }
    return false
  }

  private checkRemoved(
    declaringClassTypeText: string,
    memberName: string,
    memberNameNode: Identifier,
    unappliedTransforms: (() => Node)[]
  ) {
    if (
      //TODO first conditional is only needed as long as removed members are not differentiated
      Object.hasOwn(this.changes, 'membersRemoved') &&
      Object.hasOwn(this.changes.membersRemoved, declaringClassTypeText)
    ) {
      const matchingSignature = Object.keys(
        this.changes.membersRemoved[declaringClassTypeText]
      ).find((signature) =>
        compareSignature(signature, memberName, this.changes.typesRenamedInverse)
      )
      if (matchingSignature && !isExcluded(`${declaringClassTypeText}.${memberName}`)) {
        unappliedTransforms.push(() =>
          this.loggingFunction(
            memberNameNode,
            [memberName],
            '#insert0# has been removed',
            this.changes.membersRemoved?.[declaringClassTypeText]?.[matchingSignature]
          )
        )
      }
    }
  }

  private checkObsolete(
    parent: PropertyAccessExpression,
    declaringClassTypeText: string,
    memberName: string,
    memberNameNode: Identifier,
    unappliedTransforms: (() => Node)[]
  ) {
    if (
      //TODO first conditional is only needed as long as removed members are not differentiated
      Object.hasOwn(this.changes, 'membersObsolete') &&
      parent.getExpression().getType().getSymbol() &&
      Object.hasOwn(this.changes.membersObsolete ?? {}, declaringClassTypeText) &&
      this.changes.membersObsolete?.[declaringClassTypeText].includes(memberName)
    ) {
      // Member is a function
      unappliedTransforms.push(() =>
        this.loggingFunction(
          memberNameNode,
          [memberName],
          '#insert0# is now obsolete and can be removed',
          'warning'
        )
      )
      this.statisticsReporting.addChangeCount('membersObsolete', 1)
    }
  }
}
