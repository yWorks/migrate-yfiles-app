import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { EventListenerTransformations } from '../../../src/morphTransformations/eventListenerTransformations'
import { addMigrationComment, setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('event listener transformation', () => {
  setGlobalProject(project, false)

  it('should replace the addBendAddedListener with addEventListener(`"bend-added"`,...)', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'simpleEventListenerTransformation',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace the addBendAddedListener with addEventListener(`"bend-added"`,...) and reorder the arguments', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'eventListenerTransformationWithArgs',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace the removeMouseClickListener', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'mouseEvent', __dirname)
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace the addBendAddedListener with addEventListener(`"bend-added"`,...) and remove the sender arg', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'eventListenerTransformationUnusedSender',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace the addBendAddedListener with addEventListener(`"bend-added"`,...) and remove the sender arg, no event present', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'eventListenerTransformationUnused1',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace the addBendAddedListener with addEventListener(`"bend-added"`,...) and add an unused argument at pos 0', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'eventListenerTransformationUsed1',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace the addBendAddedListener with addEventListener(`"bend-added"`,...) and add brackets and an unused argument at pos 0', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'eventListenerTransformationNoBracket',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace the addBendAddedListener with addEventListener(`"bend-added"`,...) and remove the event arg', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'eventListenerTransformationUnusedEvent',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace the addBendAddedListener with addEventListener(`"bend-added"`,...) and remove both args', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'eventListenerTransformationUnusedArgs',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('arg in callback is object binding pattern', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'objectBindingPatternUsage',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('arg in callback is object binding pattern, some args are not used', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'objectBindingPatternPartlyUnused',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('first argument is already event args so no changes are applied', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'isAlready3_0', __dirname)
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('non anonymous function should be checked and reordered as well', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'nonAnonymousFunction',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('function is property declaration & initialization. Is checked and reordered as well', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'functionIsPropertyDeclaration',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('function is property declaration & initialization. Is checked and reordered as well, no sender is used', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'functionIsPropertyDeclarationUnusedSender',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('function is property declaration & initialization and used multiple times. Is checked and reordered as well, no sender is used', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'functionIsPropertyDeclarationUnusedSenderMultiple',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('function is property declaration with separate initialization. Is checked and reordered as well', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'functionIsPropertyDeclarationSeparate',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })

  it('function is callExpression with bind. Is checked and reordered as well', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'eventListenerBind', __dirname)
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('function is callExpression with bind with one intermediate assignment. Is checked and reordered as well', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'eventListenerBindOnceRemoved',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('function is callExpression. Is checked and reordered as well', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'eventListenerCall', __dirname)
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('item changed listener should be transform and be commented to use item-added and item-removed', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'eventListenerItemsChanged',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('event listener should also be changed on objects that are a prop on a custom class object', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'propOnClass',
      __dirname
    )
    const eventListenerTransformation = new EventListenerTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    eventListenerTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
