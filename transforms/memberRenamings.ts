import { findCommentParent, getTypesUnionString, msgUtil } from './util'
import { Options } from './master-transform'

export function doTransform({
  api,
  ast,
  filePath,
  mappings,
  from,
  to,
  options,
  secondPass
}: {
  api: any
  ast: any
  filePath: string
  mappings: any
  from: any
  to: any
  options: Options,
  secondPass: boolean
}) {
  const { logMigrationMessage, createLogMessage } = msgUtil(options)
  const { memberRenamings } = mappings
  const partialRenames = (mappings.partialRenames || []) as string[]
  const j = api.jscodeshift

  const nameMap = new Map<string, { typeName: string; newName: string }[]>()

  for (const [typeName, renameMap] of Object.entries(memberRenamings)) {
    for (const [oldName, newName] of Object.entries(renameMap)) {
      if (!nameMap.has(oldName)) {
        nameMap.set(oldName, [])
      }
      nameMap.get(oldName).push({ typeName, newName })
    }
  }

  function renameIdentifier(ident, path) {
    const oldName = ident.name
    const entries = nameMap.get(oldName)

    const types = [...new Set(entries.map(({ typeName }) => typeName))]
    const typeString = getTypesUnionString(types)
    const renames = [...new Set(entries.map(({ newName }) => newName))]
    const renameString = renames.length > 1 ? `(${renames.join('|')})` : renames[0]

    const isAmbiguousRename = !entries.every(({ newName }) => newName === entries[0].newName)
    if (options.incremental || isAmbiguousRename || partialRenames.includes(oldName)) {
      if (secondPass) {
        const old = `${typeString}.${oldName}`
        logMigrationMessage(
          filePath,
          ident,
          createLogMessage`The member ${old} has been renamed to '${renameString}' in version ${to}.`,
          findCommentParent(path)
        )
      }
      return
    }
    if (!secondPass) {
      const newName = entries[0].newName
      ident.name = newName
    }
  }

  // object.oldName -> object.newName
  ast
    .find(j.MemberExpression, { property: { type: 'Identifier', name: n => nameMap.has(n) } })
    .filter(path => path.value.object.type !== 'Identifier' || path.value.object.name !== 'yfiles')
    .forEach(path => {
      renameIdentifier(path.value.property, path)
    })

  // { oldName: value } -> { newName: value }
  ast.findObjectMembers({ key: { type: 'Identifier', name: n => nameMap.has(n) } }).forEach(path => {
    renameIdentifier(path.value.key, path)
  })

  return ast
}
