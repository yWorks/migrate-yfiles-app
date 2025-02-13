import {
  type Node,
  ObjectLiteralExpression,
  PropertyAssignment,
  type SourceFile,
  SyntaxKind
} from 'ts-morph'
import type { Changes } from '../types.js'
import {
  checkIfYfiles,
  type loggingFunction,
  type ITransformation,
  isExcluded,
  getType,
  compareSignature, replaceWithTextTryCatch
} from '../utils.js'
import type { StatisticsReport } from '../statisticsReport.js'

export class ConstructorTransformations implements ITransformation {
  sourceFile: SourceFile
  changes: Changes
  loggingFunction: loggingFunction
  statisticsReporting: StatisticsReport

  constructor(
    sourceFile: SourceFile,
    changes: Changes,
    loggingFunction: loggingFunction,
    statisticsReporting: StatisticsReport
  ) {
    this.sourceFile = sourceFile
    this.changes = changes
    this.loggingFunction = loggingFunction
    this.statisticsReporting = statisticsReporting
  }

  transform(): void {
    for (const newExpression of this.sourceFile
      .getDescendantsOfKind(SyntaxKind.NewExpression)
      .reverse()) {
      const constructedClass = newExpression.getExpression().getText()
      const constructorArgs = newExpression.getArguments()

      if (!checkIfYfiles(newExpression)) {
        continue
      }
      // check if the constructed class has any pending changes
      if (
        !Object.hasOwn(this.changes.membersRenamed, constructedClass) &&
        !Object.hasOwn(this.changes.membersObsolete ?? {}, constructedClass) &&
        !Object.hasOwn(this.changes.membersRemoved, constructedClass) &&
        !Object.hasOwn(this.changes.propertyTypesChanged, constructedClass) &&
        !Object.hasOwn(this.changes.defaultChanges ?? {}, constructedClass)
      ) {
        continue
      }
      if (constructorArgs.length === 0) {
        // if we have no args, it's an empty constructor, and we cannot do anything more
        this.checkDefaultsChanged(newExpression, [], constructedClass)
        continue
      }
      if (constructorArgs.length === 1) {
        // we might have the option overload
        const optionArg = constructorArgs[0]
        if (optionArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
          // we have the option kind with a literal expression
          this.handlePropertyAssignments(optionArg, constructedClass)
        } else if (optionArg.isKind(SyntaxKind.Identifier)) {
          // check if the identifier is an option object declared beforehand
          const symbol = optionArg.getSymbol()
          const declaration = symbol?.getDeclarations()[0]
          const objectLiteralExpressions = declaration?.getChildrenOfKind(
            SyntaxKind.ObjectLiteralExpression
          )
          objectLiteralExpressions?.forEach((objectLiteralExpression) => {
            this.handlePropertyAssignments(objectLiteralExpression, constructedClass)
          })
        } else {
          this.checkDefaultsChanged(optionArg, [optionArg], constructedClass)
        }
      } else {
        this.checkDefaultsChanged(newExpression, constructorArgs, constructedClass)
      }
    }
    return
  }

  handlePropertyAssignments(optionArg: ObjectLiteralExpression, constructedClass: string) {
    let optionProperties = optionArg.getProperties()
    for (const prop of optionProperties) {
      if (
        prop.isKind(SyntaxKind.PropertyAssignment) &&
        !isExcluded(`${constructedClass}.${prop.getName()}`)
      ) {
        const originalPropName = prop.getName()
        const renamedProp = this.checkRename(prop, constructedClass)
        // are exclusive, can not be in rename and obsolete/removed
        if (!renamedProp) {
          if (this.checkObsolete(prop, constructedClass)) {
            continue
          }
          if (this.checkRemoved(prop, constructedClass)) {
            {
              continue
            }
          }
        }
        // can be renamed and type changed
        this.checkTypeChanged(renamedProp ?? prop, originalPropName, constructedClass)
      }
    }
    //re-acquire properties in case one was obsolete-removed
    optionProperties = optionArg.getProperties()
    this.checkDefaultsChanged(optionArg, optionProperties, constructedClass)
    return
  }

  checkRename(prop: PropertyAssignment, constructedClass: string) {
    const renamedProps = this.changes.membersRenamed[constructedClass]
    const propertyName = prop.getName()
    let renamedProp
    if (renamedProps && Object.hasOwn(renamedProps, propertyName)) {
      renamedProp = replaceWithTextTryCatch(prop.getNameNode(), renamedProps[propertyName])
      this.statisticsReporting.addChangeCount('membersRenamed', 1)
    }
    return renamedProp?.getParent() as PropertyAssignment | undefined
  }
  checkObsolete(prop: PropertyAssignment, constructedClass: string) {
    const propertyName = prop.getName()
    const obsoleteProps = this.changes.membersObsolete?.[constructedClass]
    if (obsoleteProps && obsoleteProps.includes(propertyName)) {
      prop.remove()
      this.statisticsReporting.addChangeCount('membersObsolete', 1)
      return true
    }
    return false
  }
  checkRemoved(prop: PropertyAssignment, constructedClass: string) {
    const propertyName = prop.getName()
    const removedProps = this.changes.membersRemoved?.[constructedClass] ?? {}
    const matchingSignature = Object.keys(removedProps).find((signature) =>
      compareSignature(signature, propertyName, this.changes.typesRenamedInverse)
    )
    if (matchingSignature) {
      this.loggingFunction(
        prop,
        [propertyName],
        '#insert0# has been removed',
        removedProps[propertyName]
      )
      return true
    }
    return false
  }

  checkTypeChanged(prop: PropertyAssignment, originalProperty: string, constructedClass: string) {
    const newTypes = this.changes.propertyTypesChanged[constructedClass]
    const propertyName = prop.getName()
    if (newTypes && Object.hasOwn(newTypes, originalProperty)) {
      this.loggingFunction(
        prop,
        [
          propertyName,
          constructedClass,
          getType(prop.getInitializer()) ?? '',
          newTypes[originalProperty]
        ],
        `Possible breaking change: Type of #insert0# on #insert1# has changed from #insert2# to #insert3#`
      )
      this.statisticsReporting.addChangeCount('propertyTypesChanged', 1)
    }
    return
  }
  checkDefaultsChanged(node: Node, properties: Node[], constructedClass: string) {
    const defaultChanges = this.changes.defaultChanges?.[constructedClass]
    const propertyNames = properties.map((prop) => {
      if (prop.isKind(SyntaxKind.PropertyAssignment)) {
        return prop.getName()
      } else {
        return prop.getText()
      }
    })
    if (defaultChanges) {
      for (const [change, entry] of Object.entries(defaultChanges)) {
        if (propertyNames.includes(change)) {
          continue
        }
        if (
          node.isKind(SyntaxKind.ObjectLiteralExpression) ||
          !(propertyNames.length > entry.ctorPosition)
        ) {
          this.loggingFunction(
            node,
            [change, constructedClass, ...entry.values],
            entry.helpMsg
              ? entry.helpMsg
              : 'Default of: #insert0# on #insert1# has changed from #insert2# to #insert3#.'
          )
          this.statisticsReporting.addChangeCount('defaultChanges', 1)
        }
      }
      return
    }
    return
  }
}
