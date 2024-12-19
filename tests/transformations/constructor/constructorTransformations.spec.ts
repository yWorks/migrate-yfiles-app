import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { addMigrationComment, setGlobalProject } from '../../../src/utils'
import { StatisticsReport } from '../../../src/statisticsReport'
import { emptyChanges, generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'

import { ConstructorTransformations } from '../../../src/morphTransformations/constructorTransformations'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('simple constructor transformation', () => {
  setGlobalProject(project, false)

  it('should not change anything', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'nullTest', __dirname)
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      emptyChanges,
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename the circleRecognition to newMember', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'constructorMemberRenamed',
      __dirname
    )
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: { OrganicLayout: { circleRecognition: 'newMember' } }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename the circleRecognition to newMember', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'constructorMemberRenamedExtends',
      __dirname
    )
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: { OrganicLayout: { circleRecognition: 'newMember' } }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename the circleRecognition to newMember even if defined outside', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'optionArgDefined', __dirname)
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: { OrganicLayout: { circleRecognition: 'newMember' } }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename the circleRecognition to newMember and report changed type', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'renamedAndPropertyChanged',
      __dirname
    )
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: { OrganicLayout: { circleRecognition: 'newMember' } },
        propertyTypesChanged: { OrganicLayout: { circleRecognition: 'number' } }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not rename the manipulationSettings to newMember as it is non yfiles', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'nonYfilesMemberRenamed',
      __dirname
    )
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: { Project: { manipulationSettings: 'newMember' } }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should remove the "obsolete" circleRecognition member', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'constructorMemberObsolete',
      __dirname
    )
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersObsolete: { OrganicLayout: ['circleRecognition'] }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should warn that circleRecognition is removed', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'constructorMemberRemoved',
      __dirname
    )
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRemoved: { OrganicLayout: { circleRecognition: null } }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should warn that type of circleRecognition has changed to number', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'constructorMemberTypeChanged',
      __dirname
    )
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        propertyTypesChanged: { OrganicLayout: { circleRecognition: 'number' } }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not warn that type of smartComponentLayout has changed to number as it is excluded via isExcluded', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'typeIsExcluded', __dirname)
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        propertyTypesChanged: { OrganicLayout: { smartComponentLayout: 'number' } }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should warn that default of lineSpacing has changed', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'defaultChanged', __dirname)
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        defaultChanges: {
          Font: {
            lineSpacing: {
              values: [0.5, 0.2],
              ctorPosition: 3
            }
          }
        }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not warn that default of fontFamily has changed', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'defaultChangeParams',
      __dirname
    )
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        defaultChanges: {
          Font: {
            lineSpacing: {
              values: ['NewTimesRoman', 'Roboto'],
              ctorPosition: 0
            }
          }
        }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not warn of default changes, as they are already set (options)', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'defaultChangedAlreadySet',
      __dirname
    )
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        defaultChanges: {
          Font: {
            lineSpacing: {
              values: [0.5, 0.2],
              ctorPosition: 3
            }
          }
        }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not warn of default changes, as they are already set (positional)', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'defaultChangedAlreadySetPositional',
      __dirname
    )
    const constructorTransformation = new ConstructorTransformations(
      sourceFile,
      {
        ...emptyChanges,
        defaultChanges: {
          Font: {
            lineSpacing: {
              values: [0.5, 0.2],
              ctorPosition: 3
            }
          }
        }
      },
      loggingFunction,
      statisticsReporting
    )
    constructorTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
