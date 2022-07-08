import {
  ensureYFilesImport,
  findCommentParent,
  logMigrationMessage,
  createLogMessage,
  withComments,
  iPred,
} from './util'
import { Options } from './master-transform'
import j from 'jscodeshift'
import { AssignmentExpression } from 'jscodeshift/src/core'
import { apply25Transforms } from './custom-2.5'

let incremental = false
let filePath = ''

export function doTransform({
  api,
  ast,
  filePath: filePathParam,
  options,
}: {
  api: any
  ast: any
  filePath: string
  options: Options
}) {
  incremental = options.incremental
  filePath = filePathParam

  if (parseFloat(options.from) < 2) {
    handleAddConcurrentWithPriority(ast)
    handleApplyLayoutOverloads(ast)
    handleBinding(ast)
    handleLayoutGraph(ast)
    handleAbstractStyles(ast)
    handleScaledParameter(ast)
    handleDragDrop(ast)
    handleExceptions(ast)
    handleLayoutExecutor(ast)
    handleGraphControlAdd(ast)
    handleRenderDataCache(ast)
  }

  if (parseFloat(options.from) < 2.3) {
    handleOldGraphBuildersReplaced(ast)
  }

  if (parseFloat(options.from) < 2.5) {
    apply25Transforms(api, ast, filePath, options)
  }

  handleLicenses(ast)
  handleYfilesModule(ast)

  return ast

  function handleYfilesModule(ast) {
    const modulesToImport = [] as string[]

    ast
      .find(j.CallExpression, {
        callee: memberPred('yfiles.module'),
        arguments: [{ type: 'StringLiteral' }],
      })
      .replaceWith(path => {
        if (incremental) {
          logMigrationMessage(
            filePath,
            path,
            createLogMessage`It is not recommended to use ${'yfiles.module()'} anymore.`,
            findCommentParent(path)
          )
          return path.value
        }
        const args = path.value.arguments
        const moduleName = args[0].value
        if (args.length === 1) {
          if (!modulesToImport.includes(moduleName)) {
            modulesToImport.push(moduleName)
          }
          return j.identifier(`yfiles_module_${moduleName}`)
        } else if (args.length === 2) {
          const fn = args[1]
          if (
            !(fn.type === 'FunctionExpression' || fn.type === 'ArrowFunctionExpression') ||
            fn.params.length !== 1 ||
            fn.params[0].type !== 'Identifier' ||
            fn.body.type !== 'BlockStatement'
          ) {
            return path.value
          }
          const exportsName = fn.params[0].name
          // exports.Foo = value
          // => export const Foo = value
          j(fn)
            .find(j.ExpressionStatement, {
              expression: {
                type: 'AssignmentExpression',
                left: { type: 'MemberExpression', object: iPred(exportsName), property: iPred() },
                operator: '=',
              },
            })
            .replaceWith(exprPath => {
              const assignment: AssignmentExpression = <AssignmentExpression>(
                exprPath.value.expression
              )
              const left = assignment.left as j.MemberExpression
              const leftProp = left.property as j.Identifier
              const varName = leftProp.name
              const exportValue = assignment.right
              return withComments(
                j.exportNamedDeclaration(
                  j.variableDeclaration('const', [
                    j.variableDeclarator(j.identifier(varName), exportValue),
                  ])
                ),
                exprPath.value
              )
            })
          if (
            path.parentPath.value.type === 'ExpressionStatement' &&
            path.parentPath.parentPath.name === 'body'
          ) {
            const expressionStatement = path.parentPath.value
            const surroundingBody = path.parentPath.parentPath.value
            const fnBody = fn.body.body
            surroundingBody.splice(surroundingBody.indexOf(expressionStatement), 1, ...fnBody)
            return path.value
          }
          return fn.body
        }
      })

    ast.find(j.Program).forEach(path => {
      const body = path.value.body
      for (const moduleName of modulesToImport) {
        body.unshift(
          j.importDeclaration(
            [j.importNamespaceSpecifier(j.identifier(`yfiles_module_${moduleName}`))],
            j.literal(`yfiles.module('${moduleName}')`)
          )
        )
      }
    })
  }

  function handleRenderDataCache(ast) {
    ast
      .find(j.CallExpression, {
        callee: { type: 'MemberExpression', property: iPred('setRenderDataCache') },
      })
      .filter(path => path.value.arguments.length === 1)
      .replaceWith(path => {
        if (incremental) {
          logMigrationMessage(
            filePath,
            path.value.callee.property,
            createLogMessage`${'visual.setRenderDataCache(cache)'} can be replaced with ${'visual.svgElement["data-renderDataCache"] = cache'}`,
            findCommentParent(path)
          )
          return path.value
        }
        const visualObject = path.value.callee.object
        const cacheObject = path.value.arguments[0]
        return j.assignmentExpression(
          '=',
          j.memberExpression(
            j.memberExpression(visualObject, j.identifier('svgElement')),
            j.literal('data-renderDataCache')
          ),
          cacheObject
        )
      })

    ast
      .find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          property: iPred('getRenderDataCache'),
        },
      })
      .filter(path => path.value.arguments.length === 0)
      .replaceWith(path => {
        if (incremental) {
          logMigrationMessage(
            filePath,
            path.value.callee.property,
            createLogMessage`${'var cache = visual.getRenderDataCache()'} can be replaced with ${'var cache = visual.svgElement["data-renderDataCache"]'}`,
            findCommentParent(path)
          )
          return path.value
        }
        const visualObject = path.value.callee.object
        return j.memberExpression(
          j.memberExpression(visualObject, j.identifier('svgElement')),
          j.literal('data-renderDataCache')
        )
      })
  }

  function handleLicenses(ast) {
    if (incremental) {
      return
    }

    const replace1xLicense = functionType => {
      // 1.x license format
      ast
        .find(functionType, {
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  left: memberPred('g.yfiles'),
                  right: {
                    type: 'LogicalExpression',
                    operator: '||',
                    left: memberPred('g.yfiles'),
                    right: { type: 'ObjectExpression' },
                  },
                },
              },
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  left: memberPred('g.yfiles.license'),
                  right: { type: 'ObjectExpression' },
                },
              },
            ],
          },
        })
        .forEach(path => {
          let programPath = path
          while (programPath.value.type !== 'Program' && programPath.parentPath) {
            programPath = programPath.parentPath
          }

          const licenseData = path.value.body.body[1].expression.right
          programPath.value.body = [
            j.importDeclaration([j.importSpecifier(j.identifier('License'))], j.literal('yfiles')),
            j.expressionStatement(
              j.assignmentExpression(
                '=',
                j.memberExpression(j.identifier('License'), j.identifier('value')),
                licenseData
              )
            ),
          ]
        })
    }

    replace1xLicense(j.FunctionExpression)
    replace1xLicense(j.ArrowFunctionExpression)

    const replace2xLicense = functionType => {
      // 2.0 license format
      ast
        .find(functionType, {
          params: [iPred('yfiles')],
          body: {
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  left: memberPred('yfiles.license'),
                  right: { type: 'ObjectExpression' },
                },
              },
            ],
          },
        })
        .forEach(path => {
          let programPath = path
          while (programPath.value.type !== 'Program' && programPath.parentPath) {
            programPath = programPath.parentPath
          }
          const licenseData = path.value.body.body[0].expression.right
          programPath.value.body = [
            j.importDeclaration([j.importSpecifier(j.identifier('License'))], j.literal('yfiles')),
            j.expressionStatement(
              j.assignmentExpression(
                '=',
                j.memberExpression(j.identifier('License'), j.identifier('value')),
                licenseData
              )
            ),
          ]
        })
    }

    replace2xLicense(j.FunctionExpression)
    replace2xLicense(j.ArrowFunctionExpression)

    ast
      .find(j.AssignmentExpression, {
        left: memberPred('yfiles.license'),
        right: { type: 'ObjectExpression' },
      })
      .forEach(path => {
        ensureYFilesImport(ast, 'License')
        path.value.left = j.memberExpression(j.identifier('License'), j.identifier('value'))
      })
  }

  function handleGraphControlAdd(ast) {
    ast
      .find(j.CallExpression, {
        callee: { type: 'MemberExpression', property: iPred('add') },
      })
      .filter(path => path.value.arguments.length === 2)
      .forEach(path => {
        logMigrationMessage(
          filePath,
          path,
          createLogMessage`The ${'GraphControl.add(group, visual)'} method was removed in version 2.0. The recommended replacement is ${'group.addChild(visual, ICanvasObjectDescriptor.VISUAL)'}.`,
          findCommentParent(path)
        )
      })

    ast
      .find(j.CallExpression, {
        callee: { type: 'MemberExpression', property: iPred('addToGroup') },
      })
      .filter(path => path.value.arguments.length === 3)
      .forEach(path => {
        logMigrationMessage(
          filePath,
          path,
          createLogMessage`The ${'GraphControl.addToGroup(visual, descriptor, group)'} method was removed in version 2.0. The recommended replacement is ${'graphComponent[<groupName>].addChild(visual, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)'}.`,
          findCommentParent(path)
        )
      })
  }

  function handleLayoutExecutor(ast) {
    ast
      .find(j.ExpressionStatement, {
        expression: {
          type: 'AssignmentExpression',
          left: { type: 'MemberExpression', object: iPred(), property: iPred('finishHandler') },
        },
      })
      .forEach(path => {
        const parent = path.parentPath.value
        if (Array.isArray(parent)) {
          const executorName = path.value.expression.left.object.name
          const startExpressionIdx = parent.findIndex(
            e =>
              e.type === 'ExpressionStatement' &&
              e.expression.type === 'CallExpression' &&
              e.expression.callee.object.type === 'Identifier' &&
              e.expression.callee.object.name === executorName &&
              e.expression.callee.property.type === 'Identifier' &&
              e.expression.callee.property.name === 'start'
          )
          if (startExpressionIdx !== -1) {
            if (incremental) {
              logMigrationMessage(
                filePath,
                path.value.expression.left.property,
                createLogMessage`${'layoutExecutor.finishHandler = function(sender, args) {/*...*/}'} can be replaced with ${'layoutExecutor.start().then((sender, args) => {/*...*/})'}`,
                findCommentParent(path)
              )
              return
            }
            const handler = path.value.expression.right
            parent[startExpressionIdx] = j.expressionStatement(
              j.callExpression(
                j.memberExpression(parent[startExpressionIdx].expression, j.identifier('then')),
                [handler]
              )
            )
            parent.splice(parent.indexOf(path.value), 1)
          }
        }
      })
  }

  function handleExceptions(ast) {
    if (incremental) {
      ast
        .find(j.MemberExpression, {
          object: memberPred('yfiles.system'),
          property: iPred(n => n.endsWith('Exception')),
        })
        .forEach(path => {
          logMigrationMessage(
            filePath,
            path,
            createLogMessage`${'yfiles.system.[name]Exception(message)'} can be replaced with ${'Exception(message, [name])'}.`,
            findCommentParent(path)
          )
        })
      return
    }
    ast
      .find(j.ThrowStatement, {
        argument: {
          type: 'NewExpression',
          callee: {
            type: 'MemberExpression',
            object: memberPred('yfiles.system'),
            property: iPred(),
          },
          arguments: [{ type: t => t === 'StringLiteral' || t === 'Identifier' }],
        },
      })
      .replaceWith(path => {
        const exceptionName = path.value.argument.callee.property.name
        const oldArg = path.value.argument.arguments[0]
        ensureYFilesImport(ast, 'Exception')
        const result = j.throwStatement(
          j.newExpression(j.identifier('Exception'), [oldArg, j.literal(exceptionName)])
        )
        result.comments = path.value.comments
        return result
      })

    ast
      .find(j.MemberExpression, {
        object: memberPred('yfiles.system'),
        property: iPred(n => n.endsWith('Exception')),
      })
      .replaceWith(path => j.identifier('Exception'))
  }

  function handleDragDrop(ast) {
    ast
      .find(j.CallExpression, {
        callee: memberPred('yfiles.system.DragDrop.doDragDrop'),
      })
      .filter(path => path.value.arguments.length === 3)
      .replaceWith(path => {
        if (incremental) {
          logMigrationMessage(
            filePath,
            path,
            createLogMessage`${'DragDrop.doDragDrop(element, data, DragDropEffects.ALL)'} can be replaced with ${'NodeDropInputMode.startDrag(element, data, DragDropEffects.ALL)'}`,
            findCommentParent(path)
          )
          return path.value
        }
        ensureYFilesImport(ast, 'NodeDropInputMode')
        return j.callExpression(
          j.memberExpression(j.identifier('NodeDropInputMode'), j.identifier('startDrag')),
          path.value.arguments
        )
      })
  }

  function handleScaledParameter(ast) {
    ast
      .find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'NewExpression',
            callee: iPred('FreeNodePortLocationModel'),
          },
          property: iPred('createScaledParameter'),
        },
        arguments: [iPred()],
      })
      .replaceWith(path => {
        if (incremental) {
          logMigrationMessage(
            filePath,
            path,
            createLogMessage`${'new NodeScaledPortLocationModel().createScaledParameter(point)'} can be replaced with ${'FreeNodePortLocationModel.INSTANCE.createParameterForRatios(point.x + 0.5, point.y + 0.5)'}`,
            findCommentParent(path)
          )
          return path.value
        }
        const point = path.value.arguments[0]
        const params = []
        for (const prop of ['x', 'y']) {
          params.push(
            j.binaryExpression('+', j.memberExpression(point, j.identifier(prop)), j.literal(0.5))
          )
        }
        ensureYFilesImport(ast, 'FreeNodePortLocationModel')
        return j.callExpression(
          j.memberExpression(
            j.memberExpression(j.identifier('FreeNodePortLocationModel'), j.identifier('INSTANCE')),
            j.identifier('createParameterForRatios')
          ),
          params
        )
      })
  }

  function handleAbstractStyles(ast) {
    if (incremental) {
      return
    }
    const namesToCheck = ['createVisual', 'updateVisual']
    ast
      .findObjectMembers({
        key: k =>
          (k.type === 'Identifier' && namesToCheck.includes(k.name)) ||
          (k.type === 'StringLiteral' && namesToCheck.includes(k.value)),
      })
      .filter(
        path =>
          path.value.type === 'ObjectMethod' ||
          path.value.type === 'ClassMethod' ||
          path.value.value.type === 'FunctionExpression'
      )
      .forEach(path => {
        const memberName = path.value.key.name || path.value.key.value
        const fn = path.value.value || path.value
        if (
          (memberName === 'createVisual' && fn.params.length === 2) ||
          (memberName === 'updateVisual' && fn.params.length === 3)
        ) {
          // move the first parameter to the end
          fn.params.push(fn.params.shift())
        }
      })
  }

  function handleLayoutGraph(ast) {
    ast
      .find(j.NewExpression, {
        callee: memberPred('yfiles.graph.CopiedLayoutIGraph.FromGraph'),
        arguments: [iPred()],
      })
      .replaceWith(path => {
        if (incremental) {
          logMigrationMessage(
            filePath,
            path,
            createLogMessage`${'new CopiedLayoutIGraph.FromGraph(graph)'} can be replaced with ${'new LayoutGraphAdapter(graph).createCopiedLayoutGraph()'}`,
            findCommentParent(path)
          )
          return path.value
        }
        ensureYFilesImport(ast, 'LayoutGraphAdapter')
        return j.callExpression(
          j.memberExpression(
            j.newExpression(j.identifier('LayoutGraphAdapter'), path.value.arguments),
            j.identifier('createCopiedLayoutGraph')
          ),
          []
        )
      })

    ast
      .find(j.NewExpression, {
        callee: memberPred('yfiles.graph.CopiedLayoutIGraph.FromAdapter'),
        arguments: [iPred()],
      })
      .replaceWith(path => {
        if (incremental) {
          logMigrationMessage(
            filePath,
            path,
            createLogMessage`${'new CopiedLayoutIGraph.FromAdapter(adapter)'} can be replaced with ${'adapter.createCopiedLayoutGraph()'}`,
            findCommentParent(path)
          )
          return path.value
        }
        return j.callExpression(
          j.memberExpression(path.value.arguments[0], j.identifier('createCopiedLayoutGraph')),
          []
        )
      })
  }

  /**
   * Replaces
   *   treeSource.childBinding = new yfiles.binding.Binding("subordinates");
   * With
   *   treeSource.childBinding = "subordinates"
   */
  function handleBinding(ast) {
    ast
      .find(j.NewExpression, {
        callee: memberPred('yfiles.binding.Binding'),
      })
      .replaceWith(path => {
        if (incremental) {
          logMigrationMessage(
            filePath,
            path,
            createLogMessage`${'binding = new Binding("something")'} can be replaced with ${'binding = "something"'}`,
            findCommentParent(path)
          )
          return path.value
        }
        return path.value.arguments[0]
      })
  }

  function handleApplyLayoutOverloads(ast) {
    if (incremental) {
      return
    }
    ast
      .find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: iPred(),
          property: iPred(
            n => n === 'applyLayoutWithControl' || n === 'applyLayoutWithControlAndCallback'
          ),
        },
      })
      .filter(path => {
        const args = path.value.arguments
        return args.length === 3 || args.length === 4
      })
      .replaceWith(path => {
        const [layoutArg, durationArg, gcArg, handlerArg] = path.value.arguments
        const morphCall = j.callExpression(j.memberExpression(gcArg, j.identifier('morphLayout')), [
          layoutArg,
          durationArg,
        ])
        if (handlerArg) {
          return j.callExpression(j.memberExpression(morphCall, j.identifier('then')), [handlerArg])
        }
        return morphCall
      })
  }

  /**
   * Replaces
   *   graphEditorInputMode.addConcurrentWithPriority(this.createShapeInputMode, graphEditorInputMode.marqueeSelectionModePriority);
   * With
   *   this.createShapeInputMode.priority = graphEditorInputMode.marqueeSelectionInputMode.priority;
   *   graphEditorInputMode.add(this.createShapeInputMode);
   */
  function handleAddConcurrentWithPriority(ast) {
    if (incremental) {
      return
    }
    ast
      .find(j.ExpressionStatement, {
        expression: {
          callee: {
            type: 'MemberExpression',
            object: iPred(),
            property: iPred('addConcurrentWithPriority'),
          },
          arguments: [
            {},
            {
              type: 'MemberExpression',
              object: iPred(),
              property: iPred(n => n.endsWith('ModePriority')),
            },
          ],
        },
      })
      .replaceWith(path => {
        const callExpr = path.value.expression
        if (callExpr.arguments.length !== 2) {
          return path.value
        }
        const inputModeVariableName = callExpr.callee.object.name
        if (callExpr.arguments[1].object.name !== callExpr.callee.object.name) {
          return path.value
        }
        const superModeName = callExpr.callee.object.name
        const subModePriorityProperty = callExpr.arguments[1].property.name
        const subModeName = subModePriorityProperty.replace(/ModePriority$/, 'InputMode')
        const priorityAssignment = j.assignmentExpression(
          '=',
          j.memberExpression(callExpr.arguments[0], j.identifier('priority')),
          j.memberExpression(
            j.memberExpression(j.identifier(superModeName), j.identifier(subModeName)),
            j.identifier('priority')
          )
        )
        const addCall = j.callExpression(
          j.memberExpression(j.identifier(superModeName), j.identifier('add')),
          [callExpr.arguments[0]]
        )

        const to = withComments(j.expressionStatement(priorityAssignment), path.value)

        return withComments([to, j.expressionStatement(addCall)], path.value)
      })
  }

  function handleOldGraphBuildersReplaced(ast) {
    if (incremental) {
      return
    }
    ast
      .find(j.Identifier, {
        name: name => ['GraphBuilder', 'TreeBuilder', 'AdjacentNodesGraphBuilder'].includes(name),
      })
      .forEach(path => {
        if (path.parentPath.value.type === 'ImportSpecifier') {
          return
        }
        const graphBuilderName = path.value.name
        logMigrationMessage(
          filePath,
          path,
          createLogMessage`The ${graphBuilderName} class has been replaced with a more powerful but incompatible class in version 2.3. Either migrate to the new API or use the compatibility demo class ${
            'Simple' + graphBuilderName
          } available in the /utils/SimpleGraphBuilder file.`
        )
      })
  }

  /**
   * Converts member expression strings like "one.two.three" into a predicate that can be used with `j.find()`.
   */
  function memberPred(pathString: string) {
    const parts = pathString.split('.')
    if (parts.length < 2) {
      throw new Error('Path consists of only one part: ' + pathString)
    }
    let result: any = {
      type: 'MemberExpression',
      object: iPred(parts.shift()),
      property: iPred(parts.shift()),
    }
    while (parts.length) {
      result = { type: 'MemberExpression', object: result, property: iPred(parts.shift()) }
    }
    return result
  }
}
