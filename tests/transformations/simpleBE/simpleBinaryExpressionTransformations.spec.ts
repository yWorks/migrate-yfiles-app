import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { SimpleBinaryExpressionTransformations } from '../../../src/morphTransformations/simpleBinaryExpressionTransformations'
import { setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('binary expression transformation', () => {
  setGlobalProject(project, false)

  it('should change binary assignments for hierarchicLayout', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'hierarchicLayout', __dirname)
    const binaryTransformation = new SimpleBinaryExpressionTransformations(
      sourceFile,
      statisticsReporting
    )
    binaryTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
