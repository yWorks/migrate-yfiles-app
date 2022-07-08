import {
  findCommentParent,
  getTypesUnionString,
  logMigrationMessage,
  createLogMessage,
} from './util'
import { Options } from './master-transform'

export function doTransform({
  api,
  ast,
  mappings,
  filePath,
  to,
  options,
}: {
  api: any
  ast: any
  mappings: any
  filePath: string
  to: any
  options: Options
}) {
  const j = api.jscodeshift
  const { propertyTypeChanges } = mappings

  const nameMap = new Map()
  for (const [typeName, memberMap] of Object.entries(propertyTypeChanges)) {
    for (const [key, value] of Object.entries(memberMap)) {
      if (!nameMap.has(key)) {
        nameMap.set(key, { containingTypes: new Set(), newTypes: new Set() })
      }
      const entry = nameMap.get(key)
      entry.containingTypes.add(typeName)
      entry.newTypes.add(value)
    }
  }

  ast
    .find(j.MemberExpression, {
      property: { type: 'Identifier', name: n => nameMap.has(n) },
    })
    .forEach(path => {
      const propertyName = path.value.property.name
      const { containingTypes, newTypes } = nameMap.get(propertyName)
      const old = `${getTypesUnionString(containingTypes)}.${propertyName}`
      logMigrationMessage(
        filePath,
        path.value.property,
        createLogMessage`The type of the ${old} property has been changed to '${getTypesUnionString(
          newTypes,
          false
        )}' in version ${to}.`,
        findCommentParent(path)
      )
    })

  return ast
}
