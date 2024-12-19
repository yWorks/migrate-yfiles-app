import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { TypeReferenceTransformations } from '../../../src/morphTransformations/typeReferenceTransformations'
import { setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('type reference transformation', () => {
  setGlobalProject(project, false)

  it('should transform Class type to Constructor', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'classToConstructor', __dirname)
    const typeReferenceTransformations = new TypeReferenceTransformations(
      sourceFile,
      statisticsReporting
    )
    typeReferenceTransformations.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
