import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { addMigrationComment, setGlobalProject } from '../../../src/utils'
import { StatisticsReport } from '../../../src/statisticsReport'
import { emptyChanges, generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import { TypesChangedTransformation } from '../../../src/morphTransformations/checkTypesChanged'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('property Type changes', () => {
  setGlobalProject(project, false)

  it('should warn of api property type changes', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'simplePropertyTypeChange',
      __dirname
    )
    const typesChangedTransformation = new TypesChangedTransformation(
      sourceFile,
      {
        ...emptyChanges,
        propertyTypesChanged: { CanvasComponent: { div: 'HTMLElement' } }
      },
      loggingFunction,
      statisticsReporting
    )
    typesChangedTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should nor warn of api property type changes if it is excluded', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'propertyTypeChangeExcluded',
      __dirname
    )
    const typesChangedTransformation = new TypesChangedTransformation(
      sourceFile,
      {
        ...emptyChanges,
        propertyTypesChanged: { CanvasComponent: { inputMode: 'newType' } }
      },
      loggingFunction,
      statisticsReporting
    )
    typesChangedTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not warn of api property type changes if it is just a rename', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'propertyTypeChangeRename',
      __dirname
    )
    const typesChangedTransformation = new TypesChangedTransformation(
      sourceFile,
      {
        ...emptyChanges,
        propertyTypesChanged: { CanvasComponent: { div: 'HTMLElement' } },
        typesRenamed: { HTMLDivElement: 'HTMLElement' }
      },
      loggingFunction,
      statisticsReporting
    )
    typesChangedTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
describe('return Type changes', () => {
  setGlobalProject(project, false)

  it('should warn of api return type changes', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'simpleReturnTypeChange',
      __dirname
    )
    const typesChangedTransformation = new TypesChangedTransformation(
      sourceFile,
      {
        ...emptyChanges,
        returnTypesChanged: { CanvasComponent: { getCanvasObject: 'NewType' } }
      },
      loggingFunction,
      statisticsReporting
    )
    typesChangedTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not warn of api return type changes if it is excluded', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'returnTypeChangeExcluded',
      __dirname
    )
    const typesChangedTransformation = new TypesChangedTransformation(
      sourceFile,
      {
        ...emptyChanges,
        returnTypesChanged: { GraphComponent: { createRenderContext: 'NewType' } }
      },
      loggingFunction,
      statisticsReporting
    )
    typesChangedTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not warn of api return type changes if it is just a rename', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'returnTypeChangeRename',
      __dirname
    )
    const typesChangedTransformation = new TypesChangedTransformation(
      sourceFile,
      {
        ...emptyChanges,
        returnTypesChanged: { CanvasComponent: { getCanvasObject: 'NewType' } },
        typesRenamed: { ICanvasObject: 'NewType' }
      },
      loggingFunction,
      statisticsReporting
    )
    typesChangedTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not warn of api return type changes as the function/object is not yfiles', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'isNotYfiles', __dirname)
    const typesChangedTransformation = new TypesChangedTransformation(
      sourceFile,
      {
        ...emptyChanges,
        returnTypesChanged: { Project: { getTypeChecker: 'NewType' } }
      },
      loggingFunction,
      statisticsReporting
    )
    typesChangedTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
it('should not do any warning for property type changes or ReturnType changes', () => {
  setGlobalProject(project, false)
  const { sourceFile, assertSourceFile } = setupProjects(project, 'nullTest', __dirname)
  const typesChangedTransformation = new TypesChangedTransformation(
    sourceFile,
    emptyChanges,
    loggingFunction,
    statisticsReporting
  )
  typesChangedTransformation.transform()
  assert.equal(sourceFile.getText(), assertSourceFile.getText())
})
