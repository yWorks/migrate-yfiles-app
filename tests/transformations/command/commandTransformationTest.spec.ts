import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { CommandTransformation } from '../../../src/morphTransformations/commandTransformations'
import { addMigrationComment, setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('command transformation', () => {
  setGlobalProject(project, false)
  it('should transform existing commands (execute, canExecute)', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'commandTransformation',
      __dirname
    )
    const commandTransformation = new CommandTransformation(sourceFile, statisticsReporting,loggingFunction)
    commandTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not transform code if no commands (execute, canExecute) exist', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'nullTest', __dirname)
    const commandTransformation = new CommandTransformation(sourceFile, statisticsReporting,loggingFunction)
    commandTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not execute and canExecute with less than two args', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'canExecute', __dirname)
    const commandTransformation = new CommandTransformation(sourceFile, statisticsReporting,loggingFunction)
    commandTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
