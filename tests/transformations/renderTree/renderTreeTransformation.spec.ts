import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { addMigrationComment, setGlobalProject } from '../../../src/utils'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'

import { RenderTreeTransformations } from '../../../src/morphTransformations/renderTreeTransformations'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('should move functions from ICanvasObject and CanvasControl to render tree', () => {
  setGlobalProject(project, false)

  it('should move and rename ICanvasObjectGroup.addGroup() to renderTree.createGroup()', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'moveICOtoRT', __dirname)
    const renderTreeTransformations = new RenderTreeTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    renderTreeTransformations.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should warn of renaming ICanvasObjectGroup.addGroup() to renderTree.createGroup()', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'moveICOtoRTFactory', __dirname)
    const renderTreeTransformations = new RenderTreeTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    renderTreeTransformations.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should move CanvasComponent.backgroundGroup to renderTree.backgroundGroup', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'moveCCtoRT', __dirname)
    const renderTreeTransformations = new RenderTreeTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    renderTreeTransformations.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should move and rename CanvasComponent.getCanvasObjects to renderTree.getElements', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'moveCCtoRTRename', __dirname)
    const renderTreeTransformations = new RenderTreeTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    renderTreeTransformations.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should move and change signature of CanvasComponent.hitElementsAt(Point) to renderTree.hitElementsAt(Point,null)', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'moveCCtoRTChangeSignature',
      __dirname
    )
    const renderTreeTransformations = new RenderTreeTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    renderTreeTransformations.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename addChild to createElement and add the associated args', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'createElement', __dirname)
    const renderTreeTransformations = new RenderTreeTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    renderTreeTransformations.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename addChild to createElement and add the associated args when additional access is present', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'thisGCcreateElement',
      __dirname
    )
    const renderTreeTransformations = new RenderTreeTransformations(
      sourceFile,
      loggingFunction,
      statisticsReporting
    )
    renderTreeTransformations.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
