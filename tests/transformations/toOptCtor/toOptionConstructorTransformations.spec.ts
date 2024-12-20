import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'

import { ToOptionConstructorTransforms } from '../../../src/morphTransformations/toOptionConstructorTransforms'
import { addMigrationComment, setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('to Option-Constructor transformations', () => {
  setGlobalProject(project, false)

  it('should gather all pae assignments to option constructor, while all are outside', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'allOutside', __dirname)
    const methodTransformation = new ToOptionConstructorTransforms(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should gather all pae assignments to existing, but empty, option constructor, while all are outside', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'allOutsideExistingEmpty',
      __dirname
    )
    const methodTransformation = new ToOptionConstructorTransforms(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should gather all pae assignments to option constructor, while some are outside', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'someOutside', __dirname)
    const methodTransformation = new ToOptionConstructorTransforms(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should gather all pae assignments in scope to option constructor, while some are outside', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'someOutsideScope', __dirname)
    const methodTransformation = new ToOptionConstructorTransforms(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should correctly gather all pae assignments,including nested ones', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'nestedAllOutside', __dirname)
    const methodTransformation = new ToOptionConstructorTransforms(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not change for outside initialized options', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'objectInitOutside', __dirname)
    const methodTransformation = new ToOptionConstructorTransforms(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
