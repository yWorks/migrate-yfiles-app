import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { EnumTransformations } from '../../../src/morphTransformations/enumTransformations'
import { setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('enum transformation', () => {
  setGlobalProject(project, false)

  it('should replace FontWeight with string literal', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'fontWeightTransformation',
      __dirname
    )
    const enumTransformation = new EnumTransformations(sourceFile, statisticsReporting)
    enumTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not do anything as the pae is not yfiles', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'notYfiles', __dirname)
    const enumTransformation = new EnumTransformations(sourceFile, statisticsReporting)
    enumTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
