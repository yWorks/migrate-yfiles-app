import {
  CallExpression,
  FunctionDeclaration,
  Identifier,
  Node,
  type Project,
  type SourceFile,
  SyntaxKind,
  ts,
  Type,
  TypeFormatFlags
} from 'ts-morph'
import { bold, red, yellow } from 'kolorist'
import { excludeList } from './migrationData/excludeList.js'
import type { StatisticsReport } from './statisticsReport.js'
import type { Changes } from './types.js'

const testExcludeList = [
  'OrganicLayout.smartComponentLayout',
  'IRenderContext',
  'IInputMode',
  'CanvasComponent.coerceViewportLimits',
  'ICommand.ADD_LABEL'
]
const localExcludeList = process.env.NODE_TEST_CONTEXT?.includes('child')
  ? testExcludeList
  : excludeList

export interface ITransformation {
  transform: ITransformFunction
  statisticsReporting: StatisticsReport
}

export function isExcluded(typeText: string | null) {
  if (typeText) {
    return localExcludeList.includes(typeText)
  } else {
    return false
  }
}

export function returnTypeIsExcluded(identifier: Identifier) {
  const declarations = identifier.getSymbol()?.getDeclarations() as FunctionDeclaration[]
  if (declarations) {
    return declarations.some((declaration) =>
      isExcluded(normalizeType(declaration.getReturnType()))
    )
  } else {
    return false
  }
}

export interface ITransformFunction {
  (): void
  (identifier: Identifier): void
}

export type loggingFunction = {
  (
    astNode: Node,
    inserts: (string | number | null)[],
    message: string,
    migrationHelp?: string | null,
    logLevel?: 'warning' | 'error'
  ): Node
}

export function tryTransform(sourceFile: SourceFile, transform: ITransformation) {
  const unappliedTransforms: (() => void)[] = []
  for (const identifier of sourceFile.getDescendantsOfKind(ts.SyntaxKind.Identifier)) {
    if (
      identifier &&
      !identifier.wasForgotten() &&
      !identifier.getParent().isKind(SyntaxKind.ImportSpecifier) &&
      checkIfYfiles(identifier, false) &&
      !isExcluded(identifier.getText())
    ) {
      unappliedTransforms.push(() => transform.transform(identifier))
    }
  }
  for (const transform of unappliedTransforms) {
    try {
      transform()
    } catch (e) {
      console.error(e)
    }
  }
  return
}

function replaceInserts(targetString: string, inserts: (string | null | number)[]) {
  let outString = targetString
  for (let i = 0; i < inserts.length; i++) {
    const insert = inserts[i]
    outString = outString.replace(`#insert${i}#`, insert ? insert.toString() : '')
  }
  return outString
}

export const logMigrationMessage: loggingFunction = (
  astNode,
  inserts,
  message,
  migrationHelp,
  logLevel = 'error'
) => {
  try {
    const path = astNode.getSourceFile().getFilePath()
    const { line, column } = astNode.getSourceFile()!.getLineAndColumnAtPos(astNode.getStart())
    const insertExpressions = inserts.map((insert) => bold(insert ?? ''))
    const formattedMessage = replaceInserts(message, insertExpressions)
    const logColor = logLevel == 'warning' ? yellow : red
    console.log(
      logColor(
        `${formattedMessage}${migrationHelp ? '. ' : ''}${
          migrationHelp ? migrationHelp : ''
        }\n\tat ${path}:${line}:${column + 1}`
      )
    )
  } catch (e) {
    console.error(e)
  }
  return astNode
}

export const addMigrationComment: loggingFunction = (
  astNode,
  inserts,
  message,
  migrationHelp,
  logLevel = 'error'
) => {
  const formattedMessage = replaceInserts(message, inserts)
  const todoString = `TODO-Migration ${formattedMessage}${migrationHelp ? '. ' : ''}${
    migrationHelp ? migrationHelp : ''
  }`
  if (!astNode.getLeadingCommentRanges().some((range) => range.getText().includes(todoString))) {
    const isJsDoc = !astNode
      .getParentWhile((parent) => {
        return !parent.isKind(SyntaxKind.JSDoc)
      })
      ?.isKind(SyntaxKind.SourceFile)
    if (isJsDoc) {
      return astNode
    } else {
      return replaceWithTextTryCatch(astNode,(`/*${todoString}*/${astNode.getText()}`))
    }
  }

  return astNode
}

function normalizeType(typeNode: Type) {
  let text = typeNode.getText()
  if (text.includes('import')) {
    text = typeNode.getText(undefined, TypeFormatFlags.UseAliasDefinedOutsideCurrentScope)
  }
  text = text.replace('typeof ', '')
  if (text.includes('<')) {
    text = text.substring(0, text.indexOf('<'))
  }
  return text
}

export function getAliasType(node: Node) {
  let nodeType
  try {
    nodeType = node.getType()
  } catch (e) {
    // we didnt get a type return here
    // todo maybe perform a name check
    return
  }
  const unionTypes = nodeType.getApparentType().getUnionTypes()
  if (unionTypes.length > 0) {
    const unionStrings = unionTypes
      .map((type) => normalizeType(type))
      .filter((typeString) => {
        return (
          typeString !== 'null' &&
          typeString !== 'undefined' &&
          typeString !== 'never' &&
          typeString !== 'never[]'
        )
      })
    if (unionStrings.length == 1) {
      return unionStrings[0]
    } else {
      // TODO if we want to handle union types we need to get in here
      return null
    }
  } else {
    return normalizeType(node.getType().getApparentType())
  }
}

export function replaceWithTextTryCatch(node: Node, text:string){
  try{
    return node.replaceWithText(text)
  }catch (e) {
    console.log(e)
    return node
  }
}

export function getAliasBaseTypes(node: Node) {
  let typeLocallyDefined
  try {
    typeLocallyDefined = node.getType()
  } catch (e) {
    // we didnt get a type return here
    // todo maybe perform a name check
    return
  }
  return typeLocallyDefined
    .getBaseTypes()
    .map((type) => {
      return normalizeType(type)
    })
    .flatMap((type) => type.split(' & '))
}

let globalProject: Project
let globalUseCache: boolean
// TODO makes trouble with tests
let typeNodeCache: Map<string, Type> = new Map()

export function setGlobalProject(project: Project, useCache = false) {
  globalProject = project
  globalUseCache = useCache
}
export function parseStingToType(string: string) {
  let sourceFile: SourceFile = null!
  try {
    const yFilesReplace = string.replaceAll(/[A-Z]\w*/g, 'yfiles.$&')
    const parseString = `import * as yfiles from "yfiles";const a:${yFilesReplace} = null; const b:${string} = null`
    sourceFile = globalProject.createSourceFile('__temp__.ts', parseString, { overwrite: true })
    const desc = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)
    const a = desc.find((a) => a.getText() == 'a')!
    const b = desc.find((a) => a.getText() == 'b')!
    const aType = a.getType()
    return aType.getSymbol() ? aType : b.getType()
  } finally {
    sourceFile?.delete()
  }
}

function stringToTypeNode(string: string) {
  if (!typeNodeCache.has(string)) {
    typeNodeCache.set(string, parseStingToType(string))
  }
  return typeNodeCache.get(string)!
}
export function matchType(node: Node, string: string) {
  let internalString = string
  if (string.includes('UNRESOLVED')) {
    internalString = 'any'
  }
  const typeFromString = globalUseCache
    ? stringToTypeNode(internalString)
    : parseStingToType(internalString)!
  // @ts-ignore as intrinsicName is not exposed in typings
  if (typeFromString.compilerType.intrinsicName === 'error') {
    return false
  }
  let nodeType
  try {
    nodeType = node.getType()
  } catch (e) {
    return false
  }
  return (
    nodeType.getSymbol() === typeFromString.getSymbol() ||
    nodeType.isAssignableTo(typeFromString) ||
    baseTypesAreAssignable(nodeType, typeFromString)
  )
}

function baseTypesAreAssignable(nodeType: Type, checkAgainst: Type) {
  return nodeType.getBaseTypes().some((baseType: Type) => {
    return (
      baseType.getSymbol() === checkAgainst.getSymbol() || baseType.isAssignableTo(checkAgainst)
    )
  })
}

export function getType(node: Node | undefined) {
  if (!node) {
    return null
  }
  if (node.isKind(SyntaxKind.NumericLiteral)) {
    return 'number'
  } else if (node.isKind(SyntaxKind.StringLiteral)) {
    return 'string'
  } else if (node.isKind(SyntaxKind.TrueKeyword)) {
    return 'boolean'
  } else if (node.isKind(SyntaxKind.FalseKeyword)) {
    return 'boolean'
  } else {
    return getAliasType(node)
  }
}

export function isBaseClassYfiles(node: Node) {
  return node
    .getType()
    .getBaseTypes()
    .some((type) => {
      return type.getText().includes('yfiles-api')
    })
}

export function getDeclaringClass(node: Node) {
  try {
    return node.getSymbol()?.getDeclarations()[0].getParent()
  } catch (e) {
    return undefined
  }
}

export function checkIfYfiles(node: Node, checkBase = true) {
  try {
    const type = node.getType().getText()
    return type.includes('yfiles-api') || (isBaseClassYfiles(node) && checkBase)
  } catch {
    return false
  }
}
export function compareSignature(
  signatureA: string,
  signatureB: string,
  typesRenamedInverse: Changes['typesRenamedInverse'] | null
): boolean {
  if (signatureA.includes('(') && signatureB.includes('(')) {
    const signatureAsplit = signatureA.replace(')', '').split('(')
    const signatureBsplit = signatureB.replace(')', '').split('(')
    const signatureAName = signatureAsplit[0]
    const signatureAArgs = signatureAsplit[1].split(',')
    const signatureBName = signatureBsplit[0]
    const signatureBArgs = signatureBsplit[1].split(',')

    if (signatureAName == signatureBName && signatureAArgs.length == signatureBArgs.length) {
      return signatureAArgs.every((val, idx) => {
        const argB = signatureBArgs[idx].split(' | ')
        let argBvariant
        if (typesRenamedInverse) {
          argBvariant = argB.map((arg) => typesRenamedInverse[arg])
        }
        return argB.includes(val) || argBvariant?.includes(val)
      })
    } else {
      return false
    }
  } else {
    const signatureAsplit = signatureA.replace(')', '').split('(')
    const signatureBsplit = signatureB.replace(')', '').split('(')
    return signatureAsplit[0] === signatureBsplit[0]
  }
}
export function compareSignatureWithTypes(
  args: Node[],
  functionName: string,
  checkAgainstSignature: string,
  typesRenamedInverse: Changes['typesRenamedInverse'] | null
) {
  if (checkAgainstSignature.includes('(')) {
    const checkAgainstSignatureSplit = checkAgainstSignature.replace(')', '').split('(')
    const checkAgainstSignatureName = checkAgainstSignatureSplit[0]
    const checkAgainstSignatureArgs = checkAgainstSignatureSplit[1].split(',')
    if (
      functionName === checkAgainstSignatureName &&
      args.length == checkAgainstSignatureArgs.length
    ) {
      const allMatching = args.every((arg, idx) => {
        let isAssignableToVariant = false
        if (typesRenamedInverse && typesRenamedInverse[checkAgainstSignatureArgs[idx]]) {
          isAssignableToVariant = matchType(
            arg,
            typesRenamedInverse[checkAgainstSignatureArgs[idx]]
          )
        }
        return matchType(arg, checkAgainstSignatureArgs[idx]) || isAssignableToVariant
      })
      return allMatching
    }
  } else {
    return functionName == checkAgainstSignature
  }
}

export function reorderCallExpressionParameters(
  callExpression: CallExpression,
  argumentOrder: (number | string | null)[],
  rename?: string
) {
  const args = callExpression.getArguments()
  const argsTypeChanged: string[] = []
  const argsCopy = args.map((arg) => arg.getText())
  const onlyNumbers = argumentOrder.filter((val) => Number.isInteger(val)) as number[]
  const largestArgIndex = Math.max(...onlyNumbers)
  if (largestArgIndex > args.length - 1) {
    return undefined
  }
  args.forEach((arg) => {
    callExpression.removeArgument(arg)
  })
  argumentOrder.forEach((arg, i) => {
    if (typeof arg === 'number') {
      callExpression.addArgument(argsCopy[arg])
    } else {
      if (arg === null) {
        callExpression.addArgument('null')
      } else if (arg === 'any') {
        callExpression.addArgument(argsCopy[i])
        argsTypeChanged.push(
          `Argument Type at position #b${i}#_b is now #b'any'#_b, old argument is retained.`
        )
      } else {
        callExpression.addArgument(argsCopy[i] + `/*should now be of type ${arg}*/`)
        argsTypeChanged.push(`Argument Type at position #b${i}#_b changed to #b${arg}#_b`)
      }
    }
  })
  if (rename) {
    const expression = callExpression.getExpression()
    let renameNode = expression
    if (expression.isKind(SyntaxKind.PropertyAccessExpression)) {
      renameNode = expression.getNameNode()
    }
    replaceWithTextTryCatch(renameNode,rename)
  }
  return argsTypeChanged
}
