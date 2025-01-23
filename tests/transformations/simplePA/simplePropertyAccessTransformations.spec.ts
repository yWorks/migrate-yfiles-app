import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'

import { SimplePropertyAccessTransformations } from '../../../src/morphTransformations/simplePropertyAccessTransformations'
import { addMigrationComment, setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const statisticsReporting = new StatisticsReport()
const loggingFunction = addMigrationComment
const project = generateProject(__dirname)

describe('simple property access transformations', () => {
  setGlobalProject(project, false)

  it('should remove the .$class', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'removeDollarClass', __dirname)
    const methodTransformation = new SimplePropertyAccessTransformations(
      sourceFile,
      statisticsReporting,
      loggingFunction
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should transform graph.node/edgecount to graph.nodes/edges.size', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'transformNodeAndEdgeCount',
      __dirname
    )
    const methodTransformation = new SimplePropertyAccessTransformations(
      sourceFile,
      statisticsReporting,
      loggingFunction
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should transform hierarchicLayoutData.incrementalHints.incrementalLayeringNodes/incrementalSequencingItems', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'incrementalHints', __dirname)
    const methodTransformation = new SimplePropertyAccessTransformations(
      sourceFile,
      statisticsReporting,
      loggingFunction
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should transform isVertical and isHorizontal to function calls', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'lineSegmentHV', __dirname)
    const methodTransformation = new SimplePropertyAccessTransformations(
      sourceFile,
      statisticsReporting,
      loggingFunction
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should transform event.owner to event.item.owner on LabelEditingEventArgs', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'labelEditingEventArgs',
      __dirname
    )
    const methodTransformation = new SimplePropertyAccessTransformations(
      sourceFile,
      statisticsReporting,
      loggingFunction
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should transform IArrow to new Arrow(ArrowType."type")', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'arrowTransformations',
      __dirname
    )
    const methodTransformation = new SimplePropertyAccessTransformations(
      sourceFile,
      statisticsReporting,
      loggingFunction
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should add warning to OrientedRectangle.angle', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'orientedRect',
      __dirname
    )
    const methodTransformation = new SimplePropertyAccessTransformations(
      sourceFile,
      statisticsReporting,
      loggingFunction
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
