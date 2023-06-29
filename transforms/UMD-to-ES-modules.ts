import es6ModuleMappings from '../mappings/ES6ModuleMappings.json'
import * as path from 'path'
import { JSCodeshift } from 'jscodeshift/src/core'
import { Options } from './master-transform'

const es5NameMap = Object.create(null)
const yfilesEs6ModulesPath = '../../../lib/es-modules'
for (const [module, subModuleMap] of Object.entries(es6ModuleMappings)) {
  for (const nameMap of Object.values(subModuleMap)) {
    for (const [es5Name, es6Name] of Object.entries(nameMap)) {
      es5NameMap[es5Name] = { module, es6Name }
    }
  }
}
let yfilesImports = {} as Record<string, Set<string>>

export function doTransform({
  api,
  ast,
  filePath,
  options,
}: {
  api: any
  ast: any
  filePath: string
  options: Options
}) {
  if (options.incremental) {
    return ast
  }
  yfilesImports = {}
  const j: JSCodeshift = api.jscodeshift

  const sources = replaceNamespacesInComments(j, ast)

  const isCJS = isCJSCode(j, sources)

  removeUseStrict(j, sources)
  removeObsoleteComments(j, sources)
  unwrapUMDHeader(j, sources)
  unwrapSimpleDefines(j, sources)

  // add export to all values in return-statement of define and remove the return-statement
  const defines = sources.find(j.CallExpression, { callee: { name: 'define' } })
  defines.forEach(path => {
    replaceReturnStatementWithExport(j, path)
  })

  const requirePaths = extractRequirePaths(j, sources)

  const imports = collectRequireParams(j, sources)

  unwrapAMDCalls(j, sources)

  replaceYFilesCJSRequires(j, sources)

  addAMDImports(j, sources, imports, requirePaths)

  replaceYFilesAliases(j, sources)

  replaceYFilesNamespaces(j, sources)

  addYFilesImports(j, sources, isCJS)

  return sources
}

function unwrapUMDHeader(j, ast) {
  const def = ast.find(j.CallExpression, {
    callee: { name: 'define' },
    arguments: [{ type: 'ArrayExpression' }, { type: 'Identifier' }],
  })
  if (def.length === 1) {
    // the define call inside the UMD header
    const defineCall = def.get()
    const factoryFnName = defineCall.value.arguments[1].name
    const bindings = defineCall.scope.getBindings()[factoryFnName]
    // find the actual factory function
    if (bindings.length === 1) {
      let current = bindings[0]
      while (current && current.value.type !== 'CallExpression') {
        current = current.parentPath
      }
      if (
        current &&
        current.value.arguments[0] &&
        current.value.arguments[0].type === 'FunctionExpression'
      ) {
        const factoryFn = current.value.arguments[0]
        // replace whole UMD header with just the define call and the actual factory function
        j(current).replaceWith(path => defineCall.value)
        defineCall.value.arguments[1] = factoryFn
      }
    }
  }
}

function replaceNamespacesInComments(j, ast) {
  // replace fully qualified yFiles names in comments
  // has to happen separately
  ast.find(j.Comment).forEach(comment => {
    comment.value.value = comment.value.value.replace(
      /yfiles\.(\w+)\.(\w+)/g,
      (match, namespace, type) => {
        const key = `yfiles.${namespace}.${type}`
        if (!es5NameMap[key]) {
          return match
        }
        const { module, es6Name } = es5NameMap[key]
        if (!yfilesImports[module]) {
          yfilesImports[module] = new Set()
        }
        yfilesImports[module].add(es6Name)
        return es6Name
      }
    )
  })

  return j(ast.toSource())
}

function isCJSCode(j, ast) {
  const requireCalls = ast.find(j.CallExpression, { callee: { name: 'require' } })

  const allRequiresHaveOnlyOneStringArg = requireCalls.every(
    path => path.node.arguments.length === 1 && path.node.arguments[0].type !== 'ArrayExpression'
  )
  const noDefines =
    ast.find(j.CallExpression, {
      callee: { name: 'define' },
      arguments: [{ type: 'ArrayExpression' }],
    }).length === 0

  return requireCalls.length > 0 && allRequiresHaveOnlyOneStringArg && noDefines
}

function removeUseStrict(j, ast) {
  ast.find(j.Directive, { value: { value: 'use strict' } }).remove()
}

function removeObsoleteComments(j, ast) {
  ast.find(j.Node).forEach(n => {
    const comments = n.value.comments
    if (comments) {
      n.value.comments = comments.filter(
        comment => !comment.value.match(/^\s*eslint-disable(-next-line)?\s*global-require\s*$/g)
      )
    }
  })
}

/**
 * Replaces define calls that have an arrow function without a body, e.g. `define(['foo/bar'], f => f.baz)`
 */
function unwrapSimpleDefines(j, ast) {
  ast
    .find(j.CallExpression, {
      callee: { name: 'define' },
      arguments: [
        { type: 'ArrayExpression' },
        { type: 'ArrowFunctionExpression', body: { type: (t: string) => t !== 'BlockStatement' } },
      ],
    })
    .replaceWith(path => {
      return j.exportDeclaration(true, path.node.arguments[1].body)
    })
}

function replaceReturnStatementWithExport(j: JSCodeshift, container) {
  j(container)
    .find(j.ReturnStatement)
    .filter(p => j(p).closest(j.Function).get().parentPath.parentPath === container)
    .replaceWith(ret => {
      return j.exportDefaultDeclaration(ret.node.argument)
    })
}

function extractRequirePaths(j, ast) {
  const requirePaths = {} as Record<string, string>
  const requireConfig = ast.find(j.ExpressionStatement, {
    expression: {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'require',
        },
        property: {
          type: 'Identifier',
          name: 'config',
        },
      },
    },
  })
  requireConfig.findObjectMembers({ key: { name: 'paths' } }).forEach(property => {
    property.value.value.properties.forEach(prop => {
      const name = prop.key.name || prop.key.value
      requirePaths[name] = prop.value.value
      if (name.startsWith('yfiles')) {
        requirePaths[name] = prop.value.value.replace(/\/umd(\/?)/i, '/es-modules$1')
      }
    })
  })
  requireConfig.remove()
  return requirePaths
}

function collectRequireParams(j, ast) {
  const imports = new Map()
  const requireExpressions = ast.find(j.CallExpression, {
    callee: { type: 'Identifier', name: (n: string) => n === 'define' || n === 'require' },
    arguments: [
      { type: 'ArrayExpression' },
      { type: (t: string) => t === 'ArrowFunctionExpression' || t === 'FunctionExpression' },
    ],
  })
  requireExpressions.forEach(path => {
    const requireArray = path.node.arguments[0].elements.map(p => p.value)
    const requireParams =
      path.node.arguments.length < 2 ? [] : path.node.arguments[1].params.map(p => p.name)

    requireArray.forEach((val, i) => {
      if (i < requireParams.length) {
        imports.set(val, { name: requireParams[i], type: 'default' })
      } else {
        imports.set(val, { type: 'module' })
      }
    })
  })
  return imports
}

/**
 * replace require/define with the body of its function parameter
 */
function unwrapAMDCalls(j, ast) {
  let sortedSources = []
  ast
    .find(j.ExpressionStatement, {
      expression: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: n => n === 'define' || n === 'require' },
        arguments: [
          { type: 'ArrayExpression' },
          { type: (t: string) => t === 'ArrowFunctionExpression' || t === 'FunctionExpression' },
        ],
      },
    })
    .forEach(call => {
      sortedSources.push(call)
    })
  // sort sources to handle inner require-statements first
  sortedSources = sortedSources.sort((p1, p2) => {
    const block1 = p1.value.expression.arguments[1].body
    const block2 = p2.value.expression.arguments[1].body
    const start1 = block1.start
    const end1 = block1.end
    const start2 = block2.start
    const end2 = block2.end
    if (end1 < start2 || (start1 > start2 && end1 < end2)) {
      return -1
    } else if (end2 < start2 || (start2 > start1 && end2 < end1)) {
      return 1
    }
    return 0
  })
  sortedSources.forEach(path => {
    if (
      path.value.expression.arguments[0].elements.every(value => value.type === 'StringLiteral')
    ) {
      const firstExpression = path.value.expression.arguments[1].body.body[0]
      if (firstExpression) {
        firstExpression.comments = path.value.comments
      }
      delete path.value.comments
      j(path).replaceWith(path.value.expression.arguments[1].body.body)
    }
  })
}

function replaceYFilesCJSRequires(j, ast) {
  function isYFilesRequire(callExpr) {
    return (
      callExpr.arguments.length === 1 &&
      callExpr.arguments[0].type === 'StringLiteral' &&
      callExpr.arguments[0].value.includes('yfiles')
    )
  }
  ast
    .find(j.VariableDeclaration, {
      declarations: [
        { init: { type: 'CallExpression', callee: { type: 'Identifier', name: 'require' } } },
      ],
    })
    .filter(
      path =>
        path.value.declarations.length === 1 && isYFilesRequire(path.value.declarations[0].init)
    )
    .remove()
  ast
    .find(j.CallExpression, { callee: { type: 'Identifier', name: 'require' } })
    .filter(path => isYFilesRequire(path.value))
    .remove()
}

function addAMDImports(j, ast, imports: Map<string, any>, requirePaths) {
  const body = ast.find(j.Program).nodes()[0].body
  imports.forEach((val, key) => {
    if (key && !key.startsWith('yfiles')) {
      let modulePath
      if (key.endsWith('.js')) {
        if (!key.match(/^(.{0,2}\/)/)) {
          modulePath = j.literal(`./${key}`)
        } else {
          modulePath = j.literal(key)
        }
      } else {
        const index = key.indexOf('/')
        const prefix = key.substring(0, index)
        if (requirePaths[prefix]) {
          const newPath = path.posix.join(requirePaths[prefix], `${key.substring(index + 1)}.js`)
          modulePath = j.literal(newPath)
        } else {
          modulePath = j.literal(`${key}.js`)
        }
      }

      const importSpecifierArray = []
      if (val.type === 'default') {
        importSpecifierArray.push(j.importDefaultSpecifier(j.identifier(val.name)))
      }

      body.unshift(j.importDeclaration(importSpecifierArray, modulePath))
    }
  })
}

/**
 * Replaces things like:
 *   const foo = yfiles.namespace.Foo
 *   const bar = new foo()
 * With:
 *   const bar = new Foo()
 */
function replaceYFilesAliases(j, ast) {
  const variableMapping = new Map()
  ast
    .find(j.VariableDeclarator, {
      init: {
        type: 'MemberExpression',
        object: { object: { name: 'yfiles' } },
      },
    })
    .forEach(p => {
      variableMapping.set(p.value.id.name, p.value.init)
    })
    .remove()
  ast
    .find(j.MemberExpression, { object: { name: (n: string) => variableMapping.has(n) } })
    .forEach(p => {
      p.value.object = variableMapping.get(p.node.object.name)
    })
}

function replaceYFilesNamespaces(j, ast) {
  ast
    .find(j.MemberExpression, {
      object: {
        type: 'MemberExpression',
        property: { type: 'Identifier' },
        object: { type: 'Identifier', name: 'yfiles' },
      },
    })
    .forEach(path => {
      const key = 'yfiles.' + path.node.object.property.name + '.' + path.node.property.name
      if (!es5NameMap[key]) {
        return
      }
      const { module, es6Name } = es5NameMap[key]
      if (!yfilesImports[module]) {
        yfilesImports[module] = new Set()
      }
      yfilesImports[module].add(es6Name)
      j(path).replaceWith(j.identifier(es6Name))
    })
}

function addYFilesImports(j: JSCodeshift, ast, isCJS) {
  const existingImports = new Set(
    ast
      .find(j.ImportDeclaration, { source: { value: 'yfiles' } })
      .nodes()
      .map(node => {
        return node.specifiers.map(specifier => {
          return specifier.local.name
        })
      })
      .flat()
  )
  let allNames = Object.values(yfilesImports).reduce((acc, val) => acc.concat(...val), [])
  allNames = allNames.filter(name => !existingImports.has(name))
  allNames.sort()
  if (!allNames.length) {
    return
  }
  ast.find(j.Program).forEach(path => {
    const expr = isCJS
      ? j.variableDeclaration('const', [
          j.variableDeclarator(
            j.objectPattern(
              allNames.map(name => {
                const prop = j.property('init', j.identifier(name), j.identifier(name))
                prop.shorthand = true
                return prop
              })
            ),
            j.callExpression(j.identifier('require'), [j.stringLiteral('yfiles')])
          ),
        ])
      : j.importDeclaration(
          allNames.map(name => j.importSpecifier(j.identifier(name))),
          j.literal('yfiles')
        )
    path.node.body.unshift(expr)
  })
}
