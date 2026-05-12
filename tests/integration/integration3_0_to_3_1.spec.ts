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

describe('yFiles 3.0 to 3.1 integration tests', () => {
  setGlobalProject(project, false)
  it('should migrate the special case CanvasComponent.lastEventLocation', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'specialCase3_1', __dirname)
    transform(sourceFile, false, '3.0')
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should migrate general 3.1 changes', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'migration3_1', __dirname)
    transform(sourceFile, false, '3.0')
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
