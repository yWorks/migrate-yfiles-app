import { Options } from './master-transform'

const debug = require('debug')('migrate-yfiles-app:toEs6Class')

import {
  ArrayExpression,
  ArrowFunctionExpression,
  ASTNode,
  ASTPath,
  BlockStatement,
  CallExpression,
  ExpressionStatement,
  FunctionExpression,
  Identifier,
  JSCodeshift,
  MethodDefinition,
  ObjectExpression,
  ObjectMethod, ObjectProperty,
  Property
} from 'jscodeshift/src/core'
import { print } from 'recast'
import { ExpressionKind, StatementKind, PatternKind } from 'ast-types/gen/kinds'
import { ensureYFilesImport, findCommentParent, msgUtil, withComments } from './util'
import { Collection } from 'jscodeshift/src/Collection'

export function doTransform({
  api,
  ast,
  filePath,
  options
}: {
  api: any
  ast: any
  filePath: string
  options: Options
}) {
  const { logMigrationMessage } = msgUtil(options)

  if (options.incremental) {
    return ast
  }
  const j: JSCodeshift = api.jscodeshift

  const getPropertyValue = (
    collection: Collection<any>,
    propertyName: string
  ): ExpressionKind | PatternKind => {
    const prop = getProperty(collection, propertyName)
    return prop ? prop.value : null
  }

  const getProperty = function(collection, propertyName, onlyDirect = true): Property {
    const r = collection
      .find(j.ObjectProperty, {
        key: node => {
          return (
            (node.type === 'Identifier' && node.name === propertyName) ||
            (node.type === 'StringLiteral' && node.value === propertyName)
          )
        }
      })
      .filter(path => {
        return !onlyDirect || path.parentPath.parentPath.value === collection.get().value
      })
    return r.size() > 0 ? r.get().value : null
  }

  const createExtends = (jBody: Collection<any>): Identifier | CallExpression => {
    const $extends: Identifier = <Identifier>getPropertyValue(jBody, '$extends')
    const $with: ArrayExpression = <ArrayExpression>getPropertyValue(jBody, '$with')

    if ($with) {
      ensureYFilesImport(ast, 'BaseClass')
      return j.callExpression(
        j.identifier('BaseClass'),
        ($extends ? [$extends] : []).concat(<Identifier[]>$with.elements)
      )
    } else {
      return $extends
    }
  }

  const getConstructorFunction = (
    constructorValue: ExpressionKind | PatternKind
  ): FunctionExpression => {
    if (constructorValue) {
      if (constructorValue.type === 'FunctionExpression') {
        return <FunctionExpression>constructorValue
      } else if (constructorValue.type === 'ObjectExpression') {
        return <FunctionExpression>getPropertyValue(j(constructorValue), 'default')
      }
    }
    return null
  }

  /**
   * Replace named constructors with static methods that throw,
   * so the code isn't just removed.
   */
  const handleNamedConstructors = (jBody, classBody) => {
    const constructor = getProperty(jBody, 'constructor')
    if (constructor?.value?.type === 'ObjectExpression') {
      j(constructor)
        .findObjectMembers({
          key: node => {
            return node.type === 'Identifier' || node.type === 'StringLiteral'
          },
          value: {
            type: 'FunctionExpression'
          }
        })
        .forEach(path => {
          const name = getPropertyName(path.value)
          if (name !== 'default') {
            const property: Property = <Property>path.value
            const fn: FunctionExpression = <FunctionExpression>property.value
            const impl = fn.body
            const dummyMethod = j.classMethod(
              'method',
              j.identifier(name),
              fn.params,
              impl,
              false,
              true
            )
            const throws = j.throwStatement(
              j.newExpression(j.identifier('Error'), [
                j.literal(`Migrate named constructor ${name}!`)
              ])
            )
            impl.body.unshift(throws)
            classBody.unshift(dummyMethod)

            // comment out super call
            j(fn)
              .find(j.CallExpression, {
                callee: {
                  type: 'Super'
                }
              })
              .replaceWith(path => {
                const p = print(path.value).code
                return j.commentLine(` TODO ${p}`)
              })
          }
        })
    }
  }

  const handleConstructor = (jBody, classBody) => {
    const constructorFn = getConstructorFunction(getPropertyValue(jBody, 'constructor'))
    if (constructorFn) {
      const constructor = j.methodDefinition('method', j.identifier('constructor'), constructorFn)
      classBody.push(constructor)
      return constructor
    }
    return null
  }

  const addMethod = (classBody, name, method, isStatic) => {
    const newMethod = j.classMethod(
      'method',
      j.identifier(name),
      method.value.params,
      method.value.body,
      false,
      isStatic
    )
    classBody.push(newMethod)
    return newMethod
  }

  const createFieldAssignment = (name, field) => {
    return withComments(
      j.expressionStatement(
        j.assignmentExpression(
          '=',
          j.memberExpression(j.thisExpression(), j.identifier(name)),
          field.value
        )
      ),
      field
    )
  }

  const addGetter = (classBody, name, get, isStatic) => {
    const getter = j.classMethod('get', j.identifier(name), [], get.body || get.value.body, false, isStatic)
    classBody.push(getter)
    return getter
  }

  const addSetter = (classBody, name, set, isStatic) => {
    const setter = j.classMethod(
      'set',
      j.identifier(name),
      set.params || set.value.params,
      set.body || set.value.body,
      false,
      isStatic
    )
    classBody.push(setter)
    return setter
  }

  const addField = (classBody, name, field, isStatic) => {
    const newField = j.classProperty(j.identifier(name), field.value, null, isStatic)
    classBody.push(newField)
    return newField
  }

  const compareMemberExpressions = (m1, m2) => {
    if (m1.property.type === 'Identifier' && m2.property.type === 'Identifier') {
      if (m1.property.name === m2.property.name) {
        if (m1.object.type === 'MemberExpression' && m2.object.type === 'MemberExpression') {
          return compareMemberExpressions(m1.object, m2.object)
        }
        if (m1.object.type === 'Identifier' && m2.object.type === 'Identifier') {
          return m1.object.name === m2.object.name
        }
      }
    }
    return false
  }

  // *.bar.call(...)
  const getCalledMemberExpressions = jBody => {
    return jBody.find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: {
          type: 'Identifier',
          name: 'call'
        }
      }
    })
  }

  /**
   * MymageNodeStyle.$super.install.call(this, context, item);
   * or
   * yfiles.drawing.ImageNodeStyle.call(this);
   * @param jBody
   */
  const replaceSuperCalls = jBody => {
    const $extends = getPropertyValue(jBody, '$extends')
    if ($extends) {
      // extendsPath.call() => super()
      getCalledMemberExpressions(jBody)
        .filter(path => {
          return compareMemberExpressions($extends, path.value.callee.object)
        })
        .replaceWith(path => j.callExpression(j.super(), path.value.arguments.slice(1)))

      // *.$super.foo.call() => super.foo()
      getCalledMemberExpressions(jBody)
        .filter(path => {
          const functionMemberExpr = path.value.callee.object
          if (functionMemberExpr.type === 'MemberExpression') {
            const superMemberExpr = functionMemberExpr.object
            return (
              superMemberExpr.property.type === 'Identifier' &&
              superMemberExpr.property.name === '$super'
            )
          }
          return false
        })
        .replaceWith(path => {
          const functionName = path.value.callee.object.property.name
          return j.callExpression(
            j.memberExpression(j.super(), j.identifier(functionName)),
            path.value.arguments.slice(1)
          )
        })
    }
  }

  const getPropertyName = (propertyNode: ObjectProperty|ObjectMethod): string => {
    if (propertyNode.key.type === 'Identifier') {
      return propertyNode.key.name
    } else if (propertyNode.key.type === 'StringLiteral') {
      return <string>propertyNode.key.value
    } else {
      console.error(`Unknown property key type: ${propertyNode.key.type}`)
      return 'UNKNOWN'
    }
  }

  const handleNonNativeGetterSetter = (classBody, name, property, isStatic) => {
    const propertyValue = property.value
    if (propertyValue.type === 'ObjectExpression') {
      const collection = j(propertyValue)
      const get = getProperty(collection, 'get')
      if (get?.value?.type === 'FunctionExpression') {
        withComments(addGetter(classBody, name, get, isStatic), property)
      }
      const set = getProperty(collection, 'set')
      if (set?.value?.type === 'FunctionExpression') {
        withComments(addSetter(classBody, name, set, isStatic), property)
      }
      return get || set
    }
    return false
  }

  const handleChildProperties = (jBody, classBody, oldBody, isStatic, context: ClassContext) => {
    const ignoredKeys = ['constructor', '$extends', '$with', '$abstract', '$meta']
    const childProperties = jBody.findObjectMembers().filter(path => {
      return path.parentPath.parentPath.value === oldBody
    })
    const fields = []
    childProperties.forEach((path: ASTPath<ObjectMethod|ObjectProperty>) => {

      const propertyNode = path.value
      const propertyName = getPropertyName(propertyNode)

      function isMethod(property):property is ObjectMethod {
        return propertyNode.type === 'ObjectMethod'
      }
      const isFunctionMember: boolean = isMethod(propertyNode) || propertyNode.value.type === 'FunctionExpression'

      if (ignoredKeys.includes(propertyName)) {
        // ignore
      } else if (propertyName === '$static') {
        const property = propertyNode as ObjectProperty
        handleChildProperties(j(property.value), classBody, property.value, true, context)
      } else if (propertyName === '$clinit' && isStatic && isFunctionMember) {
        const fn = isMethod(propertyNode) ? propertyNode : <FunctionExpression>propertyNode.value
        context.clinit = withComments(fn.body, propertyNode)
      } else if (isMethod(propertyNode) && propertyNode.kind === 'get') {
        withComments(addGetter(classBody, propertyName, propertyNode, isStatic), propertyNode)
      } else if (isMethod(propertyNode) && propertyNode.kind === 'set') {
        withComments(addSetter(classBody, propertyName, propertyNode, isStatic), propertyNode)
      } else if (isFunctionMember) {
        withComments(addMethod(classBody, propertyName, propertyNode, isStatic), propertyNode)
      } else if (handleNonNativeGetterSetter(classBody, propertyName, propertyNode, isStatic)) {
        // ok then q:)
      } else {
        if (!isStatic) {
          fields.push(withComments(createFieldAssignment(propertyName, propertyNode), propertyNode))
        } else {
          const value: ExpressionKind = (<ObjectProperty>propertyNode).value as ExpressionKind
          context.staticFields.push(
            withComments(
              j.expressionStatement(
                j.assignmentExpression(
                  '=',
                  j.memberExpression(j.identifier(context.name), j.identifier(propertyName)),
                  value
                )
              ),
              propertyNode
            )
          )
        }
      }
    })
    return fields
  }

  const createClass = (builderFn, oldBody, context: ClassContext) => {
    debug(`Replacing class ${context.name}`)

    let classBody = []

    const jBody = j(oldBody)

    const extendsImpl = createExtends(jBody)
    replaceSuperCalls(jBody)

    let constructor: MethodDefinition = handleConstructor(jBody, classBody)
    handleNamedConstructors(jBody, classBody)

    const childProperties = jBody.findObjectMembers().filter(path => {
      return path.parentPath.parentPath.value === oldBody
    })

    const fields = handleChildProperties(jBody, classBody, oldBody, false, context)

    //
    // Initialize fields in constructor
    //
    if (fields.length) {
      if (!constructor) {
        // no constructor => generate one, so we can add field initializations
        const constructorBody = []
        const constructorImpl = j.functionExpression(null, [], j.blockStatement(constructorBody))
        if (extendsImpl) {
          constructorBody.unshift(j.expressionStatement(j.callExpression(j.super(), [])))
        }
        constructor = j.methodDefinition('method', j.identifier('constructor'), constructorImpl)
        classBody.unshift(constructor)
      }
    }

    if (constructor) {
      const constructorBody = (constructor.value.body as any).body

      const superCallExpression = j(constructor)
        .find(j.Super)
        .closest(j.ExpressionStatement)

      if (fields.length) {
        if (superCallExpression.size()) {
          superCallExpression.insertAfter(fields)
        } else {
          constructorBody.unshift(...fields)
        }
      }

      if (extendsImpl && !superCallExpression.size()) {
        constructorBody.unshift(j.expressionStatement(j.callExpression(j.super(), [])))
      }
    }

    return builderFn(j.identifier(context.name), j.classBody(classBody), extendsImpl)
  }

  const insertStatics = (context: ClassContext) => (path: ASTPath) => {
    const nodes: Array<ASTNode> = []
    nodes.push(...context.staticFields)
    if (context.clinit) {
      nodes.push(context.clinit)
    }
    return nodes
  }

  const replaceClass = getClassBody => newExpressionPath => {
    const oldBody = getClassBody(newExpressionPath)

    if (!oldBody) {
      logMigrationMessage(
        filePath,
        newExpressionPath,
        `Could not find class body.`,
        findCommentParent(newExpressionPath)
      )
      return
    }

    if (getProperty(j(oldBody), '$meta', false)) {
      logMigrationMessage(
        filePath,
        newExpressionPath,
        `Skipping class with $meta attributes. Please migrate this class manually. See https://docs.yworks.com/yfileshtml/#/dguide/class_framework#framework_attributes for details about defining meta information for yFiles types.`,
        findCommentParent(newExpressionPath)
      )
      return
    }

    const context: ClassContext = {
      name: null,
      clinit: null,
      staticFields: []
    }

    // var MyClass = new yfiles.lang.ClassDefinition()
    if (newExpressionPath.parentPath.value.type === 'VariableDeclarator') {
      context.name = newExpressionPath.parentPath.value.id.name
      j(newExpressionPath.parentPath.parentPath.parentPath)
        .replaceWith(
          withComments(
            createClass(j.classDeclaration, oldBody, context),
            newExpressionPath.parentPath.parentPath.parentPath.value
          )
        )
        .insertAfter(insertStatics(context))
    } else if (newExpressionPath.parentPath.value.type === 'AssignmentExpression') {
      // MyClass = new yfiles.lang.ClassDefinition()
      if (newExpressionPath.parentPath.value.left.type === 'Identifier') {
        context.name = newExpressionPath.parentPath.value.left.name
        j(newExpressionPath.parentPath.parentPath)
          .replaceWith(
            withComments(
              createClass(j.classDeclaration, oldBody, context),
              newExpressionPath.parentPath.parentPath.value
            )
          )
          .insertAfter(insertStatics(context))
        // exports.MyClass = new yfiles.lang.ClassDefinition()
      } else if (newExpressionPath.parentPath.value.left.type === 'MemberExpression') {
        context.name = newExpressionPath.parentPath.value.left.property.name
        j(newExpressionPath.parentPath.parentPath)
          .replaceWith(
            withComments(
              j.expressionStatement(
                j.assignmentExpression(
                  '=',
                  newExpressionPath.parentPath.value.left,
                  createClass(j.classExpression, oldBody, context)
                )
              ),
              newExpressionPath.parentPath.parentPath.value
            )
          )
          .insertAfter(insertStatics(context))
      }
      // the class declaration is a property value
    } else if (newExpressionPath.parentPath.value.type === 'ObjectProperty') {
      context.name = getPropertyName(newExpressionPath.parentPath.value)
      j(newExpressionPath).replaceWith(
        withComments(
          createClass(j.classExpression, oldBody, context),
          newExpressionPath.parentPath.value
        )
      )
    } else {
      logMigrationMessage(
        filePath,
        newExpressionPath,
        `Could not determine class name for class declaration!`,
        findCommentParent(newExpressionPath)
      )
    }
  }

  const replaceClasses = (): boolean => {
    const callee = memberPred('yfiles.lang.ClassDefinition')
    let replaced = false
    ast
      .find(j.NewExpression, {
        callee: callee,
        arguments: args => {
          return (
            (args.length === 1 && args[0].type === 'FunctionExpression') ||
            args[0].type === 'ArrowFunctionExpression'
          )
        }
      })
      .forEach(
        replaceClass(newExpressionPath => {
          replaced = true
          const classFn: FunctionExpression | ArrowFunctionExpression =
            newExpressionPath.value.arguments[0]

          const body = classFn.body
          if (body.type === 'ObjectExpression') {
            return body
          } else if (body.type === 'BlockStatement') {
            const collection = j(body).find(j.ReturnStatement, {
              argument: {
                type: 'ObjectExpression'
              }
            })
            return collection.get('argument').value
          }
          return null
        })
      )

    ast
      .find(j.CallExpression, {
        callee: memberPred('yfiles.lang.Class')
      })
      .forEach(
        replaceClass(path => {
          replaced = true
          const callExpr: CallExpression = path.value
          if (
            callExpr.arguments.length === 2 &&
            callExpr.arguments[1].type === 'ObjectExpression'
          ) {
            return callExpr.arguments[1]
          }
          return null
        })
      )

    return replaced
  }

  // loop to handle nested classes
  let replaced = true
  let runs = 0
  while (replaced && runs < 5) {
    replaced = replaceClasses()
    runs++
  }

  return ast
}

interface ClassContext {
  name: string
  clinit: BlockStatement
  staticFields: Array<ExpressionStatement>
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
    property: iPred(parts.shift())
  }
  while (parts.length) {
    result = { type: 'MemberExpression', object: result, property: iPred(parts.shift()) }
  }
  return result
}

/**
 * Converts identifier names into predicates that can be used with `j.find()`.
 */
function iPred(name?: string | ((n: string) => boolean)) {
  const result = { type: 'Identifier' } as any
  if (name) {
    result.name = name
  }
  return result
}
