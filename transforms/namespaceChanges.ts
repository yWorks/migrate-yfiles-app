import { findCommentParent, msgUtil } from './util'
import { Options } from './master-transform'

export function doTransform({
  api,
  ast,
  filePath,
  mappings,
  options
}: {
  api: any
  ast: any
  filePath: string
  mappings: any
  options: Options
}) {
  const { logMigrationMessage, createLogMessage } = msgUtil(options)

  const incremental = options.incremental
  const { namespaceChanges } = mappings
  const j = api.jscodeshift

  const lastSegmentSet = new Set()
  const nameMap = new Map()
  for (const [key, value] of Object.entries(namespaceChanges)) {
    nameMap.set(key, value)
    lastSegmentSet.add(key.split('.').pop())
  }

  ast
    .find(j.MemberExpression, {
      property: { type: 'Identifier', name: n => lastSegmentSet.has(n) }
    })
    .replaceWith(path => {
      const fqnParts = [path.value.property.name]
      let current = path.value
      while (current.object.type === 'MemberExpression') {
        current = current.object
        fqnParts.unshift(current.property.name)
      }
      fqnParts.unshift(current.object.name)
      const fqn = fqnParts.join('.')
      if (nameMap.has(fqn)) {
        const newName = nameMap.get(fqn)
        if (incremental) {
          logMigrationMessage(
            filePath,
            path.value,
            createLogMessage`The type '${fqn}' has been renamed to '${newName}'.`,
            findCommentParent(path)
          )
          return path.value
        }
        const newNameParts = newName.split('.').map(name => j.identifier(name))
        let newMemberExpression = j.memberExpression(newNameParts.shift(), newNameParts.shift())
        while (newNameParts.length) {
          newMemberExpression = j.memberExpression(newMemberExpression, newNameParts.shift())
        }
        return newMemberExpression
      }
      return path.value
    })

  return ast
}
