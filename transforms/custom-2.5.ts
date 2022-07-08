import j, { Collection, MemberExpression } from 'jscodeshift'
import { Options } from './master-transform'
import { logMigrationMessage, createLogMessage, findCommentParent, iPred } from './util'
import { Identifier } from 'jscodeshift/src/core'

export function apply25Transforms(api: any, ast: Collection, filePath: string, options: Options) {
  handleModelManager(ast, filePath)
}

function handleModelManager(ast: Collection, filePath) {
  ast
    .find(j.NewExpression, {
      callee: iPred([
        'FocusIndicatorManager',
        'HighlightIndicatorManager',
        'SelectionIndicatorManager',
        'WebGL2SelectionIndicatorManager',
      ]),
    })
    .filter(path => path.value.arguments.length === 1)
    .forEach(path => {
      const constructorIdentifier = path.value.callee as Identifier
      const managerName = constructorIdentifier.name
      logMigrationMessage(
        filePath,
        path,
        createLogMessage`The CanvasComponent parameter has been removed from the ${managerName} constructor in version 2.5. Instead, you can call the new ${'install(canvasComponent)'} method with the CanvasComponent as parameter`
      )
    })

  ast
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: iPred(['install', 'uninstall', 'add', 'remove']),
      },
    })
    .filter(path => path.value.arguments.length === 1)
    .forEach(path => {
      const propName = ((path.value.callee as MemberExpression).property as Identifier).name
      logMigrationMessage(
        filePath,
        path,
        createLogMessage`The ${`ModelManager.${propName}(arg)`} method was renamed in version 2.5. The new name is ${`ModelManager.${propName}Item(arg)`}.`,
        findCommentParent(path)
      )
    })
}
