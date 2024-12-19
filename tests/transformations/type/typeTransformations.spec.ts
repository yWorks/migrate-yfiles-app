import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { addMigrationComment, setGlobalProject, tryTransform } from '../../../src/utils'
import { StatisticsReport } from '../../../src/statisticsReport'
import { emptyChanges, generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import {
  TypesRemovedTransformations,
  TypesRenamedTransformations
} from '../../../src/morphTransformations/typeTransformations'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('type removed and renamed', () => {
  setGlobalProject(project, false)

  it('should warn of removed type', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'simpleTypeRemove', __dirname)
    const typesChangedTransformation = new TypesRemovedTransformations(
      sourceFile,
      {
        ...emptyChanges,
        typesRemoved: { GraphComponent: '' }
      },
      loggingFunction,
      statisticsReporting
    )
    tryTransform(sourceFile, typesChangedTransformation)
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename type', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'simpleTypeRename', __dirname)
    const typesRenamedTransformation = new TypesRenamedTransformations(
      sourceFile,
      {
        ...emptyChanges,
        typesRenamed: { GraphComponent: 'NewType' }
      },
      loggingFunction,
      statisticsReporting
    )
    tryTransform(sourceFile, typesRenamedTransformation)
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
