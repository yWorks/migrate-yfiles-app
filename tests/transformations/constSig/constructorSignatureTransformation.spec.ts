import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { ConstructorSignatureTransformations } from '../../../src/morphTransformations/constructorSignatureTransformations'
import { setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('constructor signature transformation', () => {
  setGlobalProject(project, false)

  it('should transform insets constructor to option arg, having the correct signature', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'insets', __dirname)
    const constructorSignatureTransformation = new ConstructorSignatureTransformations(
      sourceFile,
      statisticsReporting
    )
    constructorSignatureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not transform project constructor as it is not a yfiles class', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'isNotYfiles', __dirname)
    const constructorSignatureTransformation = new ConstructorSignatureTransformations(
      sourceFile,
      statisticsReporting
    )
    constructorSignatureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should transform hierarchical layout constructor such that considerNodeLabels becomes nodeLabelPlacement', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'considerNodeLabels', __dirname)
    const constructorSignatureTransformation = new ConstructorSignatureTransformations(
      sourceFile,
      statisticsReporting
    )
    constructorSignatureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should transform defaultLabel constructor such that clip and wrap are handled correctly', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'textWrapping', __dirname)
    const constructorSignatureTransformation = new ConstructorSignatureTransformations(
      sourceFile,
      statisticsReporting
    )
    constructorSignatureTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
