import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { emptyChanges, generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { ImportTransformations } from '../../../src/morphTransformations/importTransformations'
import { TypesRenamedTransformations } from '../../../src/morphTransformations/typeTransformations'
import { addMigrationComment, setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('import transformation', () => {
  setGlobalProject(project, false)

  it('should rename the import of GraphComponent to NewType', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'importRenamed', __dirname)
    const typesRenamedTransformation = new TypesRenamedTransformations(
      sourceFile,
      {
        ...emptyChanges,
        typesRenamed: { GraphComponent: 'NewType' }
      },
      loggingFunction,
      statisticsReporting
    )
    const enumTransformation = new ImportTransformations(
      sourceFile,
      emptyChanges,
      typesRenamedTransformation,
      statisticsReporting
    )
    enumTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not rename the import of Project to NewType as it is not a yfiles import', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'nonYfiles', __dirname)
    const typesRenamedTransformation = new TypesRenamedTransformations(
      sourceFile,
      {
        ...emptyChanges,
        typesRenamed: { Project: 'NewType' }
      },
      loggingFunction,
      statisticsReporting
    )
    const enumTransformation = new ImportTransformations(
      sourceFile,
      emptyChanges,
      typesRenamedTransformation,
      statisticsReporting
    )
    enumTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should remove the import of GraphComponent', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'importRemoved', __dirname)
    const typesRenamedTransformation = new TypesRenamedTransformations(
      sourceFile,
      emptyChanges,
      loggingFunction,
      statisticsReporting
    )
    const enumTransformation = new ImportTransformations(
      sourceFile,
      {
        ...emptyChanges,
        typesRemoved: { GraphComponent: null }
      },
      typesRenamedTransformation,
      statisticsReporting
    )
    enumTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename the import of GraphComponent to Point but Point is already imported', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'alreadyImported', __dirname)
    const typesRenamedTransformation = new TypesRenamedTransformations(
      sourceFile,
      {
        ...emptyChanges,
        typesRenamed: { GraphComponent: 'Point' }
      },
      loggingFunction,
      statisticsReporting
    )
    const enumTransformation = new ImportTransformations(
      sourceFile,
      emptyChanges,
      typesRenamedTransformation,
      statisticsReporting
    )
    enumTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
