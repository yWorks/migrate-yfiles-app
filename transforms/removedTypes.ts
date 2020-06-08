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
  const { removedTypes } = mappings
  const removalMessages = (mappings.removalMessages || {}) as Record<string, string>
  const removalMessageMap = new Map<string, string>()
  for (const [key, value] of Object.entries(removalMessages)) {
    removalMessageMap.set(key, value)
  }

  const identifierList = removedTypes.map(type => type.split('.').pop())

  ast
    .find(j.Identifier)
    .filter(p => identifierList.includes(p.value.name))
    .forEach(p => {
      const removedTypeName = getTypesUnionString([p.value.name])
      let message =
        createLogMessage`The type '${removedTypeName}' has been removed` + ` in version ${to}.`
      if (removalMessageMap.has(removedTypeName)) {
        message += ' ' + removalMessageMap.get(removedTypeName)
      }
      logMigrationMessage(filePath, p, message, findCommentParent(p))
    })
  return ast
}
