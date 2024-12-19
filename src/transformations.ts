import { SourceFile } from 'ts-morph'
import type { Changes } from './types.js'
import changesJson from './migrationData/yFiles_2-6_3-0_migration_mappings.js'
import changesOverride from './migrationData/changesOverride.js'
import { addMigrationComment, logMigrationMessage, tryTransform } from './utils.js'
import { ToOptionConstructorTransforms } from './morphTransformations/toOptionConstructorTransforms.js'
import { StatisticsReport } from './statisticsReport.js'
import { generateTransformationInstances } from './generateTransformationInstances.js'
import _ from 'lodash'

export function transform(
  sourceFile: SourceFile,
  experimental = false,
  target = 'default'
): StatisticsReport {
  const changes = _.merge(changesJson, changesOverride) as unknown as Changes
  changes.typesRenamedInverse = Object.entries(changes.typesRenamed)?.reduce(
    (out: { [key: string]: string }, entry) => {
      const [k, v] = entry
      out[v] = k
      return out
    },
    {}
  )
  const statisticsReporting = new StatisticsReport()
  const loggingFunction = target == 'default' ? addMigrationComment : logMigrationMessage
  const transformationInstances = generateTransformationInstances(
    sourceFile,
    changes,
    loggingFunction,
    statisticsReporting
  )

  // specific migrations
  if (target != 'yfiles') {
    transformationInstances.renderTreeTransformations.transform()
    transformationInstances.commandTransformation.transform()
    transformationInstances.constructorSignatureTransformations.transform()
    transformationInstances.typeReferenceTransformations.transform()
    transformationInstances.simplePropertyAccessTransformations.transform()
    transformationInstances.simpleCallExpressionTransformations.transform()
    transformationInstances.simpleBinaryExpressionTransformations.transform()
    transformationInstances.enumTransformations.transform()
    tryTransform(sourceFile, transformationInstances.voidTransformations)
  }
  //change-rule based migrations
  transformationInstances.memberTransform.transform()
  transformationInstances.methodTransformation.transform()
  if (target != 'yfiles') {
    transformationInstances.typesChangedTransformation.transform()
  }
  transformationInstances.constructorTransformations.transform()
  if (target != 'yfiles') {
    transformationInstances.changeFunctionSignatures.transform()
  }
  if (experimental) {
    const toOptionConstructorTransform = new ToOptionConstructorTransforms(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    toOptionConstructorTransform.transform()
  }

  //Rename of types should be last as the other variant rely on the older ones
  tryTransform(sourceFile, transformationInstances.typesRenamedTransformation)
  tryTransform(sourceFile, transformationInstances.typesRemovedTransformation)

  //EventListeners need the renamings
  if (target != 'yfiles') {
    transformationInstances.eventListenerTransformation.transform()
  }

  // clean up the imports
  transformationInstances.importTransformations.transform()
  return statisticsReporting
}
