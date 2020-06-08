import j from 'jscodeshift'
import { ASTNode, ASTPath, Node } from 'jscodeshift/src/core'

import colors from 'colors/safe'
import { Options } from './master-transform'

export const MIGRATIONS_FOR_VERSION = {
  '1.3': ['migration-1.3-to-2.0.json', 'migration-2.0-to-2.1.json', 'migration-2.1-to-2.2.json'],
  '2.0': ['migration-2.0-to-2.1.json', 'migration-2.1-to-2.2.json'],
  '2.1': ['migration-2.1-to-2.2.json', 'migration-2.2-to-2.3.json'],
  '2.2': ['migration-2.2-to-2.3.json']
}
// 1.4 didn't have breaking changes, but we offer it as an option anyway
MIGRATIONS_FOR_VERSION['1.4'] = MIGRATIONS_FOR_VERSION['1.3']

export function ensureYFilesImport(ast, ...classNames) {
  const importDeclarations = ast.find(j.ImportDeclaration, {
    source: { type: 'Literal', value: 'yfiles' },
    specifiers: [{ type: 'ImportSpecifier' }]
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

export const msgUtil = options => {
  return {
    createLogMessage: (
      strings: TemplateStringsArray,
      red: string,
      green: string = null,
      version: string = ''
    ): string => {
      const redColored = options.nocolor ? red : colors.brightRed(red)
      const greenColored = green ? (options.nocolor ? green : colors.green(green)) : ''
      return `${strings[0]}${redColored}${strings[1]}${greenColored}${
        strings.length > 2 ? strings[2] : ''
      }${version}`
    },

    logMigrationMessage: (
      filePath,
      astPathOrNode: ASTPath | ASTNode,
      message: string,
      parentExpression: ASTNode = null
    ) => {
      const ignored =
        parentExpression &&
        parentExpression['comments'] &&
        parentExpression['comments'].some(comment => comment.value.includes('@migration-ignore'))
      if (!ignored) {
        const { line, column } = getPathLocation(astPathOrNode)
        const locationStr = `${filePath}:${line}:${column + 1}`
        const location = options.nocolor ? locationStr : colors.cyan(locationStr)

        if (options.singleline) {
          console.log(`${location} - ${message}`)
        } else {
          console.log(`${message.replace(/\.$/, '')}\n\tat ${location}`)
        }
      }
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
      column: 1
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
    'ReturnStatement'
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
