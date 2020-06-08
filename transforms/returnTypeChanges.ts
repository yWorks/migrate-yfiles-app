import { findCommentParent, getTypesUnionString, msgUtil } from './util'
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
  const j = api.jscodeshift
  const { returnTypeChanges } = mappings

  const nameMap = new Map()
  for (const [typeName, memberMap] of Object.entries(returnTypeChanges)) {
    for (const [key, value] of Object.entries(memberMap)) {
      if (!nameMap.has(key)) {
        nameMap.set(key, { containingTypes: new Set(), newTypes: new Set() })
      }
      const entry = nameMap.get(key)
      entry.containingTypes.add(typeName)
      entry.newTypes.add(value || 'void')
    }
  }

  ast
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: n => nameMap.has(n) }
      }
    })
    .forEach(path => {
      const methodName = path.value.callee.property.name
      const { containingTypes, newTypes } = nameMap.get(methodName)
      const old = `${getTypesUnionString(containingTypes)}.${methodName}()`
      const message = createLogMessage`The return type of ${old} has been changed to '${getTypesUnionString(
        newTypes,
        false
      )}' in version ${to}.`
      logMigrationMessage(filePath, path.value.callee.property, message, findCommentParent(path))
    })

  return ast
}
