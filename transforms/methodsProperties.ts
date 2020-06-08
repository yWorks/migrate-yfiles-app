import { JSCodeshift } from 'jscodeshift/src/core'
import { findCommentParent, msgUtil } from './util'
import { Options } from './master-transform'

export function doTransform({
  api,
  ast,
  mappings,
  filePath,
  to,
  options
}: {
  api: any
  ast: any
  mappings: any
  filePath: string
  to: any
  options: Options
}) {
  const { logMigrationMessage, createLogMessage } = msgUtil(options)

  const incremental = options.incremental
  const j: JSCodeshift = api.jscodeshift
  const { methodsProperties } = mappings

  const nameMaps = { method: new Map(), property: new Map() }
  for (const [typeName, memberMap] of Object.entries(methodsProperties)) {
    for (const [key, value] of Object.entries(memberMap)) {
      const map = value === 'method' ? nameMaps.method : nameMaps.property
      const otherMap = value === 'method' ? nameMaps.property : nameMaps.method
      if (!map.has(key)) {
        map.set(key, new Set([typeName]))
      } else {
        if (otherMap.has(key)) {
          throw new Error(
            `The name '${key}' is mapped to become a method and a property simultaneously!`
          )
        }
        map.get(key).add(typeName)
      }
    }
  }

  // a.property = 0 -> a.property(0)
  ast
    .find(j.AssignmentExpression, {
      left: {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: n => nameMaps.method.has(n) }
      }
    })
    .replaceWith(path => {
      if (incremental) {
        const prop = path.value.left.property
        logMigrationMessage(
          filePath,
          prop,
          createLogMessage`The property '${prop.name}' is now a method.`,
          findCommentParent(path)
        )
        return path.value
      }
      return j.callExpression(path.value.left, [path.value.right])
    })

  // foo(a.property) -> foo(a.property())
  ast
    .find(j.MemberExpression, {
      property: { type: 'Identifier', name: n => nameMaps.method.has(n) }
    })
    .filter(path => path.parentPath.value.type !== 'CallExpression')
    .replaceWith(path => {
      if (incremental) {
        const prop = path.value.property
        logMigrationMessage(
          filePath,
          prop,
          createLogMessage`The property '${prop.name}' is now a method.`,
          findCommentParent(path)
        )
        return path.value
      }
      return j.callExpression(path.value, [])
    })

  ast
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: n => nameMaps.property.has(n) }
      }
    })
    .replaceWith(path => {
      const method = path.value.callee.property
      if (path.value.arguments.length === 0) {
        // a.property() -> a.property
        if (incremental) {
          logMigrationMessage(
            filePath,
            method,
            createLogMessage`The method '${method.name}' is now a property.`,
            findCommentParent(path)
          )
          return path.value
        }
        return path.value.callee
      } else if (path.value.arguments.length === 1) {
        // a.property(0) -> a.property = 0
        if (incremental) {
          logMigrationMessage(
            filePath,
            method,
            createLogMessage`The method '${method.name}' is now a property.`,
            findCommentParent(path)
          )
          return path.value
        }
        return j.assignmentExpression('=', path.value.callee, path.value.arguments[0])
      }
      return path.value
    })

  return ast
}
