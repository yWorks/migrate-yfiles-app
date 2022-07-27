import {
  findCommentParent,
  getTypesUnionString,
  logMigrationMessage,
  createLogMessage,
} from './util'
import { Options } from './master-transform'

const AMBIGUOUS_MARKER = 'ambiguous'

export function doTransform({
  api,
  ast,
  mappings,
  filePath,
  to,
  options,
  secondPass,
}: {
  api: any
  ast: any
  mappings: any
  filePath: string
  to: string
  options: Options
  secondPass: boolean
}) {
  const incremental = options.incremental
  const j = api.jscodeshift
  const { signatureChanges } = mappings
  const partialRenames = (mappings.partialRenames || []) as string[]

  const nameMap = new Map()
  const typesMap = new Map()
  for (const [typeName, memberMap] of Object.entries(signatureChanges)) {
    for (const [key, value] of Object.entries(memberMap)) {
      if (!nameMap.has(key)) {
        nameMap.set(key, value)
      } else if (Array.isArray(nameMap.get(key)) && !arrayEquals(nameMap.get(key), value)) {
        nameMap.set(key, AMBIGUOUS_MARKER)
      }
      if (!typesMap.has(key)) {
        typesMap.set(key, new Set())
      }
      typesMap.get(key).add(typeName)
    }
  }

  if (!secondPass && !incremental) {
    ast
      .find(j.NewExpression, {
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: n => nameMap.has(n) },
        },
      })
      .forEach(path => {
        path.value.callee = path.value.callee.object
      })
  }

  ast
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: n => nameMap.has(n) },
      },
    })
    .forEach(path => {
      const functionName = path.value.callee.property.name
      if (
        incremental ||
        nameMap.get(functionName) === AMBIGUOUS_MARKER ||
        partialRenames.includes(functionName)
      ) {
        if (!secondPass) {
          return
        }
        // signature change is ambiguous, only output warning
        const types = typesMap.get(functionName) as Set<string>
        const typeString = getTypesUnionString(types)
        const old = `${typeString}.${functionName}`
        logMigrationMessage(
          filePath,
          path.value.callee.property,
          createLogMessage`The signature of '${old}' has changed in version ` + to,
          findCommentParent(path)
        )
        return
      }
      if (secondPass) {
        return
      }
      const args = path.value.arguments
      const entry = nameMap.get(functionName)
      if (!entry.some) {
        console.log('!!! ' + functionName)
      }
      if (entry.some(e => typeof e !== 'number')) {
        // just a parameter type change. We ignore it for now, as there is only one
        return
      }

      const newArgs = []
      for (let i = 0; i < Math.max(args.length, entry.length); ++i) {
        if (i in entry) {
          if (entry[i] < args.length) {
            // move argument
            newArgs[i] = args[entry[i]]
          } else {
            // need to move an argument that's not there
            logMigrationMessage(
              filePath,
              path.value.callee.property,
              createLogMessage`The signature of '${functionName}' has changed in version ` + to,
              findCommentParent(path)
            )
            newArgs[i] = j.identifier('undefined')
          }
        } else {
          // just remove
        }
      }

      path.value.arguments = newArgs
    })

  return ast
}

function arrayEquals(a1, a2) {
  // we only need shallow equality for our use case
  return a1.length === a2.length && a1.every((elem, index) => elem === a2[index])
}
