import { NewLineKind, Project, QuoteKind } from 'ts-morph'
import * as path from 'node:path'

export const emptyChanges = {
  typesRenamed: {},
  typesRemoved: {},
  membersNew: {},
  typesNew: [],
  membersRenamed: {},
  membersRemoved: {},
  signaturesChanged: {},
  constructorMappings: {},
  compatMethods: {},
  propertyTypesChanged: {},
  returnTypesChanged: {},
  moduleChanges: {}
}

export function generateProject(dir: string) {
  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
      newLineKind:
        process.platform === 'win32' ? NewLineKind.CarriageReturnLineFeed : NewLineKind.LineFeed
    }
  })
  project.addSourceFilesAtPaths([path.join(dir, './test/*.ts'), path.join(dir, './assert/*.ts')])
  return project
}

export function setupProjects(project: Project, name: string, dir: string) {
  const testPath = path.join(dir, `/test/${name}.ts`)
  const assertPath = path.join(dir, `/assert/${name}.ts`)
  const sourceFile = project.getSourceFile(testPath)!
  const assertSourceFile = project.getSourceFile(assertPath)!
  return { sourceFile: sourceFile, assertSourceFile: assertSourceFile }
}
