import { SimplePropertyAccessTransformations } from './morphTransformations/simplePropertyAccessTransformations.js'
import { SimpleCallExpressionTransformations } from './morphTransformations/simpleCallExpressionTransformations.js'
import { MemberTransformations } from './morphTransformations/memberTransformations.js'
import {
  TypesRemovedTransformations,
  TypesRenamedTransformations
} from './morphTransformations/typeTransformations.js'
import { ConstructorTransformations } from './morphTransformations/constructorTransformations.js'
import { ChangeFunctionSignatures } from './morphTransformations/changeFunctionSignatures.js'
import { TypesChangedTransformation } from './morphTransformations/checkTypesChanged.js'
import { EventListenerTransformations } from './morphTransformations/eventListenerTransformations.js'
import { CommandTransformation } from './morphTransformations/commandTransformations.js'
import { VoidTransformations } from './morphTransformations/voidTransformations.js'
import { ImportTransformations } from './morphTransformations/importTransformations.js'
import { EnumTransformations } from './morphTransformations/enumTransformations.js'
import { RenderTreeTransformations } from './morphTransformations/renderTreeTransformations.js'
import { MethodTransformations } from './morphTransformations/methodTransformations.js'
import { ConstructorSignatureTransformations } from './morphTransformations/constructorSignatureTransformations.js'
import { TypeReferenceTransformations } from './morphTransformations/typeReferenceTransformations.js'
import type { SourceFile } from 'ts-morph'
import type { Changes } from './types.js'
import type { loggingFunction } from './utils.js'
import type { StatisticsReport } from './statisticsReport.js'
import { SimpleBinaryExpressionTransformations } from './morphTransformations/simpleBinaryExpressionTransformations.js'

export function generateTransformationInstances(
  sourceFile: SourceFile,
  changes: Changes,
  loggingFunction: loggingFunction,
  statisticsReporting: StatisticsReport
) {
  const typesRenamedTransformation = new TypesRenamedTransformations(
    sourceFile,
    changes,
    loggingFunction,
    statisticsReporting
  )
  return {
    simplePropertyAccessTransformations: new SimplePropertyAccessTransformations(
      sourceFile,
      statisticsReporting,
      loggingFunction
    ),
    simpleCallExpressionTransformations: new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    ),
    memberTransform: new MemberTransformations(
      sourceFile,
      changes,
      loggingFunction,
      statisticsReporting
    ),
    typesRenamedTransformation: typesRenamedTransformation,
    typesRemovedTransformation: new TypesRemovedTransformations(
      sourceFile,
      changes,
      loggingFunction,
      statisticsReporting
    ),
    constructorTransformations: new ConstructorTransformations(
      sourceFile,
      changes,
      loggingFunction,
      statisticsReporting
    ),
    changeFunctionSignatures: new ChangeFunctionSignatures(
      sourceFile,
      changes,
      loggingFunction,
      statisticsReporting
    ),
    typesChangedTransformation: new TypesChangedTransformation(
      sourceFile,
      changes,
      loggingFunction,
      statisticsReporting
    ),
    eventListenerTransformation: new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    ),
    commandTransformation: new CommandTransformation(sourceFile, statisticsReporting),
    voidTransformations: new VoidTransformations(sourceFile, statisticsReporting),
    importTransformations: new ImportTransformations(
      sourceFile,
      changes,
      typesRenamedTransformation,
      statisticsReporting
    ),
    enumTransformations: new EnumTransformations(sourceFile, statisticsReporting),
    renderTreeTransformations: new RenderTreeTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    ),
    methodTransformation: new MethodTransformations(sourceFile, changes, statisticsReporting),
    constructorSignatureTransformations: new ConstructorSignatureTransformations(
      sourceFile,
      statisticsReporting
    ),
    typeReferenceTransformations: new TypeReferenceTransformations(sourceFile, statisticsReporting),
    simpleBinaryExpressionTransformations: new SimpleBinaryExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
  }
}
