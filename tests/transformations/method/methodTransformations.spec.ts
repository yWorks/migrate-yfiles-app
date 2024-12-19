import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { StatisticsReport } from '../../../src/statisticsReport'
import { emptyChanges, generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'

import { MethodTransformations } from '../../../src/morphTransformations/methodTransformations'
import { setGlobalProject } from '../../../src/utils'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('member transformations', () => {
  setGlobalProject(project, false)

  it('should rename the createContentGroup method to newMethod', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'renameMethod', __dirname)
    const methodTransformation = new MethodTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: { CanvasComponent: { createContentGroup: 'newMethod' } }
      },
      statisticsReporting
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not rename the createContentGroup method to newMethod', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'notExtending', __dirname)
    const methodTransformation = new MethodTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: { CanvasComponent: { createContentGroup: 'newMethod' } }
      },
      statisticsReporting
    )
    methodTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
