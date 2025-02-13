import {
  BinaryExpression,
  ClassDeclaration,
  Expression,
  type Identifier,
  NewExpression,
  ObjectLiteralExpression,
  PropertyAccessExpression,
  type PropertyAssignment,
  ShorthandPropertyAssignment,
  type SourceFile,
  Statement,
  SyntaxKind
} from 'ts-morph'
import { checkIfYfiles, type loggingFunction, type ITransformation, replaceWithTextTryCatch } from '../utils.js'
import _ from 'lodash'
import type { StatisticsReport } from '../statisticsReport.js'

function buildOptionArgument(args: object[], existingArgs: string[] = []) {
  const merged = args.reduce((o1, o2) => _.merge(o1, o2), {})
  if (existingArgs.length > 0) {
    return `${recursionObjectToString(merged)?.slice(0, -1)}, ${existingArgs.join(',')}}`
  }
  return `${recursionObjectToString(merged)}`
}

function recursionObjectToString(obj: object | undefined | string): string | undefined {
  if (typeof obj == 'string') {
    return obj
  }
  if (obj) {
    return `{${Object.entries(obj)
      .map(([key, value]) => {
        return `${key}:${recursionObjectToString(value)}`
      })
      .join(', ')}}`
  }
  return
}

function decomposeNestedPropertyAccessExpression(
  expression: PropertyAccessExpression | Identifier | BinaryExpression | Expression,
  rightSide = {}
): { id: string; right: object } | undefined {
  if (expression.isKind(SyntaxKind.Identifier)) {
    return { id: expression.getText(), right: rightSide }
  }
  if (expression.isKind(SyntaxKind.BinaryExpression)) {
    const left = expression.getLeft()
    if (left.isKind(SyntaxKind.PropertyAccessExpression)) {
      return decomposeNestedPropertyAccessExpression(left.getExpression(), {
        [left.getName()]: expression.getRight().getFullText()
      })
    }
  }

  if (expression.isKind(SyntaxKind.PropertyAccessExpression)) {
    const leftExpression = expression.getExpression()
    const rightExpression = expression.getName()
    if (leftExpression.isKind(SyntaxKind.Identifier)) {
      return { id: leftExpression.getText(), right: { [rightExpression]: rightSide } }
    }
    if (leftExpression.isKind(SyntaxKind.PropertyAccessExpression)) {
      return decomposeNestedPropertyAccessExpression(leftExpression, {
        [rightExpression]: rightSide
      })
    }
  }
}

function getResolvedSymbol(node: NewExpression) {
  const expression = node.getExpression()
  const symbol = expression.getSymbol()
  let resolvedSymbol
  if (
    symbol &&
    symbol.getDeclarations() &&
    symbol.getDeclarations()[0].isKind(SyntaxKind.ImportSpecifier)
  ) {
    resolvedSymbol = symbol.getAliasedSymbol()
  }
  return resolvedSymbol
}

function getApplicableParent(node: NewExpression) {
  const parent = node.getParent()
  if (
    parent.isKind(SyntaxKind.VariableDeclaration) &&
    parent.getParent().isKind(SyntaxKind.VariableDeclarationList) &&
    parent.getParent().getParent().isKind(SyntaxKind.VariableStatement)
  ) {
    return { parent: parent.getParent().getParent(), variableName: parent.getName() }
  }
  if (
    parent.isKind(SyntaxKind.BinaryExpression) &&
    parent.getParent()?.isKind(SyntaxKind.ExpressionStatement) &&
    parent.getOperatorToken().isKind(SyntaxKind.EqualsToken)
  ) {
    return { parent: parent.getParent(), variableName: parent.getLeft().getText() }
  }
}

export class ToOptionConstructorTransforms implements ITransformation {
  sourceFile: SourceFile
  loggingFunction: loggingFunction
  statisticsReporting: StatisticsReport
  private nodesToRemove = new Set<Statement>()

  constructor(
    sourceFile: SourceFile,
    loggingFunction: loggingFunction,
    statisticsReporting: StatisticsReport
  ) {
    this.sourceFile = sourceFile
    this.loggingFunction = loggingFunction
    this.statisticsReporting = statisticsReporting
  }
  private visit(newExpression: NewExpression) {
    if (!checkIfYfiles(newExpression)) {
      return
    }
    const optionArgsOutsideConstructor: object[] = []
    const parentInfo = getApplicableParent(newExpression)
    if (!parentInfo) {
      return
    }
    const { parent: parentStatement, variableName } = parentInfo
    const constructorArgs = newExpression.getArguments()

    //if not option arg dont do anything
    if (constructorArgs.length > 1) {
      return
    }

    if (constructorArgs.length == 1) {
      const objArg = constructorArgs[0]
      if (!objArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
        return
      }
    }
    if (constructorArgs.length == 0) {
      const declarations = getResolvedSymbol(newExpression)?.getDeclarations()
      if (
        !declarations
          ?.filter((decl) => decl.isKind(SyntaxKind.ClassDeclaration))
          .some((decl) =>
            (decl as ClassDeclaration)
              .getMembers()
              .some(
                (decl) =>
                  decl.isKind(SyntaxKind.Constructor) &&
                  decl.getParameters().length == 1 &&
                  decl.getParameters()[0].getTypeNode()?.isKind(SyntaxKind.TypeLiteral)
              )
          )
      ) {
        return
      }
    }
    if (parentStatement) {
      //Find
      parentStatement.getNextSiblings().forEach((reference) => {
        if (reference.isKind(SyntaxKind.ExpressionStatement)) {
          const expression = reference.getExpression()
          if (
            expression.isKind(SyntaxKind.BinaryExpression) &&
            expression.getOperatorToken().isKind(SyntaxKind.EqualsToken)
          ) {
            const propertyAccessExpression = expression.getLeft()
            const decomposedPae = decomposeNestedPropertyAccessExpression(expression)
            if (
              decomposedPae &&
              propertyAccessExpression.isKind(SyntaxKind.PropertyAccessExpression) &&
              decomposedPae?.id == variableName
            ) {
              optionArgsOutsideConstructor.push(decomposedPae.right)
              this.nodesToRemove.add(reference)
            }
          }
        }
      })
    }
    // no outside args found
    if (optionArgsOutsideConstructor.length == 0) {
      return
    }
    // all args set outside
    if (constructorArgs.length === 0) {
      const optionObject = buildOptionArgument(optionArgsOutsideConstructor)
      newExpression.addArgument(`${optionObject}`)
      this.statisticsReporting.addChangeCount('toOptionConstructorTransformation', 1)
      return
    }

    // already existing options constructor
    if (constructorArgs.length === 1) {
      const objArg = constructorArgs[0] as ObjectLiteralExpression
      const props = objArg.getProperties()
      if (
        props.some(
          (prop) =>
            !prop.isKind(SyntaxKind.PropertyAssignment) &&
            !prop.isKind(SyntaxKind.ShorthandPropertyAssignment)
        )
      ) {
        return
      }
      const existingArgs = (props as (PropertyAssignment | ShorthandPropertyAssignment)[]).map(
        (prop) => {
          return `${prop.getName()}: ${prop.getInitializer()?.getText()}`
        }
      )
      const newObjArg = buildOptionArgument(optionArgsOutsideConstructor, existingArgs)
      replaceWithTextTryCatch(objArg, newObjArg)
      this.statisticsReporting.addChangeCount('toOptionConstructorTransformation', 1)
      return
    }
  }
  transform() {
    this.sourceFile
      .getDescendantsOfKind(SyntaxKind.NewExpression)
      .reverse()
      .forEach((newExp) => this.visit(newExp))

    this.nodesToRemove.forEach((node) => {
      try {
        node.remove()
      } catch {}
    })
    return
  }
}
