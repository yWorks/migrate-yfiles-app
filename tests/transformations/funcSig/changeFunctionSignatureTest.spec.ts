import { ChangeFunctionSignatures } from '../../../src/morphTransformations/changeFunctionSignatures'
import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { addMigrationComment, setGlobalProject } from '../../../src/utils'
import { StatisticsReport } from '../../../src/statisticsReport'
import { emptyChanges, generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('simple signature Changes', () => {
  setGlobalProject(project, false)
  it('should not change gc.zoomTo', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'nullTest', __dirname)
    const changeFunctionSignatures = new ChangeFunctionSignatures(
      sourceFile,
      emptyChanges,
      loggingFunction,
      statisticsReporting
    )
    changeFunctionSignatures.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should change the order of gc.zoomTo', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'simpleSignatureChange',
      __dirname
    )
    const changeFunctionSignatures = new ChangeFunctionSignatures(
      sourceFile,
      {
        ...emptyChanges,
        signaturesChanged: { CanvasComponent: { 'zoomTo(Point,number)': [1, 0] } }
      },
      loggingFunction,
      statisticsReporting
    )
    changeFunctionSignatures.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should change the order of copy()', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'signatureWithUnresolved',
      __dirname
    )
    const changeFunctionSignatures = new ChangeFunctionSignatures(
      sourceFile,
      {
        ...emptyChanges,
        signaturesChanged: {
          GraphCopier: {
            'copy(IGraph,UNRESOLVED.Predicate,IGraph,Point,UNRESOLVED.ElementCopiedCallback)': [
              0, 2, 3, 4
            ]
          }
        }
      },
      loggingFunction,
      statisticsReporting
    )
    changeFunctionSignatures.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not change in a second application due to parameter mismatch', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'simpleSignatureChangeTwice',
      __dirname
    )
    const changeFunctionSignatures = new ChangeFunctionSignatures(
      sourceFile,
      {
        ...emptyChanges,
        signaturesChanged: { CanvasComponent: { 'zoomTo(Point,number)': [1, 0] } }
      },
      loggingFunction,
      statisticsReporting
    )
    changeFunctionSignatures.transform()
    changeFunctionSignatures.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not change in a second application due to existing todo-comment', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'simpleSignatureChangeComment',
      __dirname
    )
    const changeFunctionSignatures = new ChangeFunctionSignatures(
      sourceFile,
      {
        ...emptyChanges,
        signaturesChanged: { Point: { 'distanceToSegment(Point,Point)': [1, 0] } }
      },
      loggingFunction,
      statisticsReporting
    )
    changeFunctionSignatures.transform()
    changeFunctionSignatures.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not change getTypeChecker, as it is not a yfiles function', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'isNotYfiles', __dirname)
    const changeFunctionSignatures = new ChangeFunctionSignatures(
      sourceFile,
      {
        ...emptyChanges,
        signaturesChanged: { Project: { getTypeChecker: ['number'] } }
      },
      loggingFunction,
      statisticsReporting
    )
    changeFunctionSignatures.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should quit early as the call expression does not have pae as expression', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'noPaeCall', __dirname)
    const changeFunctionSignatures = new ChangeFunctionSignatures(
      sourceFile,
      emptyChanges,
      loggingFunction,
      statisticsReporting
    )
    changeFunctionSignatures.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})

describe('function changes with types', () => {
  setGlobalProject(project, false)
  it('should change the order of gc.zoomTo and add a new argument', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'signatureChangeWithTypes',
      __dirname
    )
    const changeFunctionSignatures = new ChangeFunctionSignatures(
      sourceFile,
      {
        ...emptyChanges,
        signaturesChanged: { CanvasComponent: { 'zoomTo(Point,number)': [1, 0, 'GraphComponent'] } }
      },
      loggingFunction,
      statisticsReporting
    )
    changeFunctionSignatures.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
