import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { addMigrationComment, setGlobalProject, tryTransform } from '../../../src/utils'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { VoidTransformations } from '../../../src/morphTransformations/voidTransformations'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('change void', () => {
  setGlobalProject(project, false)

  it('should change the instances of voids', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'simpleVoidTransform',
      __dirname
    )
    const voidTransformations = new VoidTransformations(sourceFile, statisticsReporting)
    tryTransform(sourceFile, voidTransformations)
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not change anything', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'notYfiles', __dirname)
    const voidTransformations = new VoidTransformations(sourceFile, statisticsReporting)
    tryTransform(sourceFile, voidTransformations)
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
