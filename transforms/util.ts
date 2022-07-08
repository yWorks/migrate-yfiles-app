import j from 'jscodeshift'
import { ASTNode, ASTPath } from 'jscodeshift/src/core'
import path from 'path'
import fs from 'fs'

import colors from 'colors/safe'

import meta from '../mappings/meta.json'

export const MIGRATIONS_FOR_VERSION = {}
const migrationVersions = meta.versions.filter(v => v !== '1.4')
for (let i = migrationVersions.length - 2; i >= 0; i--) {
  const from = migrationVersions[i]
  const to = migrationVersions[i + 1]
  const mappingPath = path.join(__dirname, '../mappings', `migration-${from}-to-${to}.json`)
  const entry = {
    mappings: require(mappingPath),
    from,
    to,
  }
  MIGRATIONS_FOR_VERSION[from] = (MIGRATIONS_FOR_VERSION[to] || []).concat(entry)
}
// 1.4 didn't have breaking changes, but we offer it as an option anyway
MIGRATIONS_FOR_VERSION['1.4'] = MIGRATIONS_FOR_VERSION['1.3']

export function ensureYFilesImport(ast, ...classNames) {
  const importDeclarations = ast.find(j.ImportDeclaration, {
    source: { type: 'Literal', value: 'yfiles' },
    specifiers: [{ type: 'ImportSpecifier' }],
  })
  let importDecl
  if (importDeclarations.length === 1) {
    importDecl = importDeclarations.paths()[0].value
  } else {
    importDecl = j.importDeclaration([], j.literal('yfiles'))
    ast.find(j.Program).forEach(path => {
      path.node.body.unshift(importDecl)
    })
  }
  for (const name of classNames) {
    if (!importDecl.specifiers.some(spec => spec.imported.name === name)) {
      importDecl.specifiers.push(j.importSpecifier(j.identifier(name)))
    }
  }
  importDecl.specifiers.sort((a, b) => a.imported.name.localeCompare(b.imported.name))
}

export const logOptions = {
  nocolor: false,
  singleline: false,
}

export function createLogMessage(
  strings: TemplateStringsArray,
  red: string,
  green: string = null,
  version: string = ''
): string {
  const redColored = logOptions.nocolor ? red : colors.brightRed(red)
  const greenColored = green ? (logOptions.nocolor ? green : colors.green(green)) : ''
  return `${strings[0]}${redColored}${strings[1]}${greenColored}${
    strings.length > 2 ? strings[2] : ''
  }${version}`
}

export function logMigrationMessage(
  filePath,
  astPathOrNode: ASTPath | ASTNode,
  message: string,
  parentExpression: ASTNode = null
) {
  const ignored =
    parentExpression &&
    parentExpression['comments'] &&
    parentExpression['comments'].some(comment => comment.value.includes('@migration-ignore'))
  if (!ignored) {
    const { line, column } = getPathLocation(astPathOrNode)
    const locationStr = `${filePath}:${line}:${column + 1}`
    const location = logOptions.nocolor ? locationStr : colors.cyan(locationStr)

    if (logOptions.singleline) {
      console.log(`${location} - ${message}`)
    } else {
      console.log(`${message.replace(/\.$/, '')}\n\tat ${location}`)
    }
  }
}

export function withComments(to, from): typeof to {
  to.comments = from.comments
  return to
}

function getPathLocation(astPathOrNode: ASTPath | ASTNode) {
  const astPath = isAstPath(astPathOrNode) ? astPathOrNode : j(astPathOrNode).paths()[0]
  let current = astPath
  while (current && !current.value.loc) {
    current = current.parentPath
  }
  if (current && current.value.loc) {
    return current.value.loc.start
  } else {
    return {
      line: 1,
      column: 1,
    }
  }
}

export function getTypesUnionString(types: Set<string> | Array<string>, shorten: boolean = true) {
  let arr = types instanceof Set ? [...types] : types
  const names = shorten ? arr.map(fqn => fqn.substring(fqn.lastIndexOf('.') + 1)) : arr
  return names.length > 1 ? `(${names.join('|')})` : names[0]
}

export function findCommentParent(path: ASTPath): ASTNode {
  let p: ASTPath = path
  const parentTypesWithComments = [
    'ExpressionStatement',
    'VariableDeclaration',
    'Property',
    'ReturnStatement',
  ]
  while (p && !parentTypesWithComments.includes(p.node.type) && !('comments' in p.node)) {
    p = p.parentPath
  }
  return p ? p.node : null
}

/**
 * Try to guess if a thing is an ASTPath
 */
function isAstPath(thing: any): thing is ASTPath {
  return 'parentPath' in thing
}

/**
 * Converts identifier names into predicates that can be used with `j.find()`.
 */
export function iPred(name?: string | ((n: string) => boolean) | string[]) {
  const result = { type: 'Identifier' } as any
  if (name) {
    if (Array.isArray(name)) {
      result.name = n => name.includes(n)
    } else {
      result.name = name
    }
  }
  return result
}
