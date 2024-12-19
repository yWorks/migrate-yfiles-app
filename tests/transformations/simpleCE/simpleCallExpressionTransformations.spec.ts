import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { SimpleCallExpressionTransformations } from '../../../src/morphTransformations/simpleCallExpressionTransformations'
import { setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('call expression transformation', () => {
  setGlobalProject(project, false)

  it('should remove Class.ensure(GraphComponent)', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'removeEnsure', __dirname)
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should remove Class.fixType(GraphComponent)', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'removeEnsure', __dirname)
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename Class.ensure(LayoutExecutor) to LayoutExecutor.ensure()', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'layoutExecutor', __dirname)
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename Size.From([20,20]) to New.Size([20,20])', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'sizeFrom', __dirname)
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace graph.getWidth(node) with node.layout.width and other get and set)', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'positionGetsAndSets',
      __dirname
    )
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace graph.getDataProvider(NodeDataKey) with graph.context.getItemData)', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'getDataProvider', __dirname)
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace gmm.setStyle with gmm.graph.setStyle', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'gmmSetStyle', __dirname)
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace setSelected with add/remove', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'addRemoveSelected', __dirname)
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace A.isInstance(b) with b instanceof A', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'isInstance', __dirname)
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should convert string convertibles from north, south... to top, bottom...', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'createParameterConvertibles',
      __dirname
    )
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should replace createDefaultParameter', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'labelModelDefaultParam',
      __dirname
    )
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })

  it('should replace layoutGraph.set size with node.layout.width/height', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'layoutGraphSetSize', __dirname)
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })

  it('should change clearHighlights and addHighlight on HighlightIndicatorManager to selectionMode.clear/add respectively', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'highlightIndicatorManager',
      __dirname
    )
    const ensureTransformation = new SimpleCallExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    ensureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
