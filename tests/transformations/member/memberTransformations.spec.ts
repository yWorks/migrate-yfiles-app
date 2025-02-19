import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { addMigrationComment, setGlobalProject } from '../../../src/utils'
import { StatisticsReport } from '../../../src/statisticsReport'
import { emptyChanges, generateProject, setupProjects } from '../../testUtils'
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'

import { MemberTransformations } from '../../../src/morphTransformations/memberTransformations'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const loggingFunction = addMigrationComment
const statisticsReporting = new StatisticsReport()
const project = generateProject(__dirname)

describe('member transformations', () => {
  setGlobalProject(project, false)

  it('should rename the getCanvasObject to newMember', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'simpleMemberRenamed',
      __dirname
    )
    const memberTransformation = new MemberTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: { CanvasComponent: { getCanvasObject: 'newMember' } }
      },
      loggingFunction,
      statisticsReporting
    )
    memberTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not rename the getTypeChecker to newMember as it is not a yfile function', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'notYfiles', __dirname)
    const memberTransformation = new MemberTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: { Project: { getTypeChecker: 'newMember' } }
      },
      loggingFunction,
      statisticsReporting
    )
    memberTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should not warn the coerceViewportLimits to newMember as it is excluded', () => {
    const { sourceFile, assertSourceFile } = setupProjects(project, 'isExcluded', __dirname)
    const memberTransformation = new MemberTransformations(
      sourceFile,
      {
        ...emptyChanges,
        returnTypesChangedTypesChanged: { CanvasComponent: { coerceViewportLimits: 'newType' } }
      },
      loggingFunction,
      statisticsReporting
    )
    memberTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename the backGroundGroup to newMember and firstChild to newMember2', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'chainedMemberRenamed',
      __dirname
    )
    const memberTransformation = new MemberTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: {
          CanvasComponent: { backgroundGroup: 'newMember' },
          ICanvasObjectGroup: { firstChild: 'newMember2' }
        }
      },
      loggingFunction,
      statisticsReporting
    )
    memberTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename the enum constant value EAST to RIGHT', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'enumConstantRename',
      __dirname
    )
    const memberTransformation = new MemberTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRenamed: {
          ExteriorLabelModel: { EAST: 'RIGHT' },
        }
      },
      loggingFunction,
      statisticsReporting
    )
    memberTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should rename get of IDataProvider', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'idataProviderMembers',
      __dirname
    )
    const memberTransformation = new MemberTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRemoved: {
          "DataProviderBase": {
            "create": null,
            "getBoolean": "Use 'get', NOTE: Check the default return's type.",
            "getInt": "Use 'get', NOTE: Check the default return's type.",
            "getNumber": "Use 'get', NOTE: Check the default return's type."
          }
        }
      },
      loggingFunction,
      statisticsReporting
    )
    memberTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should warn of removal of getCanvasObject', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'simpleMemberRemoved',
      __dirname
    )
    const memberTransformation = new MemberTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersRemoved: { CanvasComponent: { getCanvasObject: '' } }
      },
      loggingFunction,
      statisticsReporting
    )
    memberTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
  it('should instruct to remove getCanvasObject as it is marked obsolete', () => {
    const { sourceFile, assertSourceFile } = setupProjects(
      project,
      'simpleMemberObsolete',
      __dirname
    )
    const memberTransformation = new MemberTransformations(
      sourceFile,
      {
        ...emptyChanges,
        membersObsolete: { CanvasComponent: ['getCanvasObject'] }
      },
      loggingFunction,
      statisticsReporting
    )
    memberTransformation.transform()
    assert.equal(sourceFile.getText(), assertSourceFile.getText())
  })
})
