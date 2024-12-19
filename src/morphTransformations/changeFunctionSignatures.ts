import { type CallExpression, type SourceFile, SyntaxKind, ts, Node } from 'ts-morph'
import {
  checkIfYfiles,
  compareSignatureWithTypes,
  getDeclaringClass,
  getType,
  type ITransformation,
  type loggingFunction,
  reorderCallExpressionParameters
} from '../utils.js'
import type { Changes } from '../types.js'
import type { StatisticsReport } from '../statisticsReport.js'

export class ChangeFunctionSignatures implements ITransformation {
  sourceFile: SourceFile
  signaturesChanged: Changes['signaturesChanged']
  typesRenamedInverse: Changes['typesRenamedInverse']
  loggingFunction: loggingFunction
  statisticsReporting: StatisticsReport

  constructor(
    sourceFile: SourceFile,
    changes: Changes,
    loggingFunction: loggingFunction,
    statisticsReporting: StatisticsReport
  ) {
    this.sourceFile = sourceFile
    this.signaturesChanged = changes.signaturesChanged
    this.typesRenamedInverse = changes.typesRenamedInverse
    this.loggingFunction = loggingFunction
    this.statisticsReporting = statisticsReporting
  }

  transform() {
    for (const callExpression of this.sourceFile
      .getDescendantsOfKind(ts.SyntaxKind.CallExpression)
      .reverse()) {
      const paeExpression = callExpression.getExpression()
      // yfiles does not export functions
      if (!paeExpression.isKind(SyntaxKind.PropertyAccessExpression)) {
        continue
      }
      const paeExpressionLeftHand = paeExpression.getExpression()

      const paeRightHand = paeExpression.getName()
      const paeExpressionType = getType(paeExpressionLeftHand)
      const declaringClass = getDeclaringClass(paeExpression)
      if (declaringClass && !checkIfYfiles(declaringClass)) {
        continue
      }
      const declaringType = getType(declaringClass)
      if (declaringType && Object.hasOwn(this.signaturesChanged, declaringType)) {
        const args = callExpression.getArguments()
        const matchingSignature = this.getMatchingSignature(declaringType, paeRightHand, args)
        if (matchingSignature) {
          this.applySignatureChange(callExpression, declaringType, matchingSignature)
        }
      }
    }
    return
  }

  private applySignatureChange(
    callExpression: CallExpression,
    paeExpressionType: string,
    matchingSignature: string
  ) {
    const argumentOrder = this.signaturesChanged[paeExpressionType][matchingSignature]
    if (
      !callExpression
        .getLeadingCommentRanges()
        .some((range) => range.getText().includes('TODO-Migration Signature changes '))
    ) {
      const originalCallExpressionText = callExpression.getText()
      const typesChanged = reorderCallExpressionParameters(callExpression, argumentOrder)
      if (typesChanged) {
        if (typesChanged.length > 0) {
          this.loggingFunction(
            callExpression,
            [originalCallExpressionText],
            'Signature changes in the signature of #insert0#, undefined placeholders have been inserted where needed.'
          )
        } else {
          this.loggingFunction(
            callExpression,
            [originalCallExpressionText],
            'Signature changes have been applied to #insert0#, verify if the applied changes are desired'
          )
        }
        this.statisticsReporting.addChangeCount('signaturesChanged', 1)
      }
    }
  }

  private getMatchingSignature(paeExpressionType: string, paeRightHand: string, args: Node[]) {
    return Object.keys(this.signaturesChanged[paeExpressionType]).find((signature) =>
      compareSignatureWithTypes(args, paeRightHand, signature, this.typesRenamedInverse)
    )
  }
}
