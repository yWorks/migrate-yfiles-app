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
  filePath,
  mappings,
  to,
  options,
}: {
  api: any
  ast: any
  filePath: string
  mappings: any
  to: any
  options: Options
}) {
  const j = api.jscodeshift
  const { removedMembers } = mappings
  const removalMessages = (mappings.removalMessages || {}) as Record<string, string>
  const removalMessageMap = new Map<string, string>()
  for (const [key, value] of Object.entries(removalMessages)) {
    removalMessageMap.set(key, value)
  }
  const memberToTypes = new Map()
  for (const [type, memberArray] of Object.entries(removedMembers)) {
    for (const member of memberArray as string[]) {
      if (!memberToTypes.has(member)) {
        memberToTypes.set(member, [])
      }
      const types = memberToTypes.get(member)
      if (!types.includes(type)) {
        types.push(type)
      }
    }
  }

  ast
    .find(j.MemberExpression, {
      property: { type: 'Identifier', name: n => memberToTypes.has(n) },
    })
    .forEach(p => {
      const renamedMemberName = p.value.property.name
      const types = memberToTypes.get(renamedMemberName)
      const typeString = getTypesUnionString(types)
      const old = `${typeString}.${renamedMemberName}`
      let message = createLogMessage`The member '${old}' has been removed` + ` in version ${to}.`
      if (removalMessageMap.has(renamedMemberName)) {
        message += ' ' + removalMessageMap.get(renamedMemberName)
      }
      logMigrationMessage(filePath, p.value.property, message, findCommentParent(p))
    })
  return ast
}
