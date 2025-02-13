import { SourceFile } from 'ts-morph'
import type { Changes } from './types.js'
import changesJson2_6 from './migrationData/yFiles_2-6_3-0_migration_mappings.js'
import changesOverride2_6 from './migrationData/changesOverride.js'
import changesJsonEAP1 from './migrationData/yfiles_EAP1_EAP2_migration_mappings.js'
import changesJsonEAP2 from './migrationData/yfiles_EAP1_EAP2_migration_mappings.js'
import { addMigrationComment, logMigrationMessage, tryTransform } from './utils.js'
import { ToOptionConstructorTransforms } from './morphTransformations/toOptionConstructorTransforms.js'
import { StatisticsReport } from './statisticsReport.js'
import { generateTransformationInstances } from './generateTransformationInstances.js'
import _ from 'lodash'

export function transform(
  sourceFile: SourceFile,
  experimental = false,
  fromVersion = '2.6'
): StatisticsReport {
  let changes:Changes
  switch (fromVersion) {
    case '2.6':
      changes = _.merge(changesJson2_6, changesOverride2_6) as unknown as Changes
      break
    case 'EAP1':
      changes = changesJsonEAP1 as unknown as Changes
      break
    case 'EAP2':
      changes = changesJsonEAP1 as unknown as Changes
      break
    default:
      throw new Error('Invalid Version to migrate from')
  }
  changes.typesRenamedInverse = Object.entries(changes.typesRenamed)?.reduce(
    (out: { [key: string]: string }, entry) => {
      const [k, v] = entry
      out[v] = k
      return out
    },
    {}
  )
  const statisticsReporting = new StatisticsReport()
  const loggingFunction = fromVersion == '2.6' ? addMigrationComment : logMigrationMessage
  const transformationInstances = generateTransformationInstances(
    sourceFile,
    changes,
    loggingFunction,
    statisticsReporting
  )

  // specific migrations
  if (fromVersion == '2.6') {
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
  if (fromVersion == '2.6') {
    transformationInstances.typesChangedTransformation.transform()
  }
  transformationInstances.constructorTransformations.transform()
  if (fromVersion == '2.6') {
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
  if (fromVersion == '2.6') {
    transformationInstances.eventListenerTransformation.transform()
  }

  // clean up the imports
  transformationInstances.importTransformations.transform()
  return statisticsReporting
}
