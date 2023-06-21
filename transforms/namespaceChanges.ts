import { findCommentParent, logMigrationMessage, createLogMessage } from './util'
import { Options } from './master-transform'

export function doTransform({
  api,
  ast,
  filePath,
  mappings,
  options,
}: {
  api: any
  ast: any
  filePath: string
  mappings: any
  options: Options
}) {
  const incremental = options.incremental
  const { namespaceChanges } = mappings
  const j = api.jscodeshift

  const fqnNameMap = new Map()
  const nonFqnNameMap = new Map()
  for (const [key, value] of Object.entries(namespaceChanges) as [string, string][]) {
    fqnNameMap.set(key, value)
    const nonFqnKey = key.split('.').pop()
    const nonFqnValue = value.split('.').pop()
    nonFqnNameMap.set(nonFqnKey, nonFqnValue)
  }

  ast
    .find(j.Identifier, {
      name: n => nonFqnNameMap.has(n),
    })
    .replaceWith(path => {
      if (path.parentPath && j.MemberExpression.check(path.parentPath.value) && path.parentPath.value.property === path.value) {
        return path.value
      }
      const oldName = path.value.name
      const newName = nonFqnNameMap.get(oldName)
      if (incremental) {
        logMigrationMessage(
          filePath,
          path.value,
          createLogMessage`The type '${oldName}' has been renamed to '${newName}'.`,
          findCommentParent(path)
        )
        return path.value
      }
      return j.identifier(newName)
    })

  ast
    .find(j.MemberExpression, {
      property: { type: 'Identifier', name: n => nonFqnNameMap.has(n) },
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
      if (fqnNameMap.has(fqn)) {
        const newName = fqnNameMap.get(fqn)
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
