import { describe, it } from 'node:test'
import { setGlobalProject } from '../../src/utils'
import { generateProject, setupProjects } from '../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { transform } from '../../src/transformations'
import * as assert from 'node:assert'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const project = generateProject(__dirname)

describe('basic integration tests', () => {
  setGlobalProject(project, false)
  it('should migrate the testfile1 to 3.0 api', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'integration1', __dirname)
    const report = transform(sourceFile)
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should migrate the testfile2 to 3.0 api', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'integration2', __dirname)
    const report = transform(sourceFile)
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
