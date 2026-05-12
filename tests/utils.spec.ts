import { describe, it, before } from 'node:test'
import * as assert from 'node:assert'
import { Project, SyntaxKind, NewLineKind, QuoteKind } from 'ts-morph'
import {
  checkIfYfiles,
  isBaseClassYfiles,
  getType,
  setGlobalProject,
  matchType,
  compareSignature
} from '../src/utils.js'

describe('utils', () => {
  let project: Project
  before(() => {
    project = new Project({
      compilerOptions: {
        moduleResolution: 99, // ts.ModuleResolutionKind.NodeNext
        module: 199, // ts.ModuleKind.NodeNext
        target: 9, // ts.ScriptTarget.ESNext
        esModuleInterop: true,
        lib: ['ESNext', 'DOM']
      },
      manipulationSettings: {
        quoteKind: QuoteKind.Single,
        newLineKind:
          process.platform === 'win32' ? NewLineKind.CarriageReturnLineFeed : NewLineKind.LineFeed
      }
    })
  })

  describe('checkIfYfiles', () => {
    it('should recognize yfiles-api types', () => {
      const sourceFile = project.createSourceFile(
        'test1.ts',
        `
        import { GraphComponent } from 'yfiles-api'
        const gc: GraphComponent = {} as any
      `,
        { overwrite: true }
      )
      const gcNode = sourceFile.getVariableDeclaration('gc')!
      // Mock the type text since we don't have real yfiles-api in node_modules
      const originalGetType = gcNode.getType
      gcNode.getType = () => ({
        getText: () => 'import("yfiles-api").GraphComponent',
        getBaseTypes: () => []
      }) as any

      assert.strictEqual(checkIfYfiles(gcNode), true)
      gcNode.getType = originalGetType
    })

    it('should recognize @yfiles/yfiles types', () => {
      const sourceFile = project.createSourceFile(
        'test2.ts',
        `
        import { GraphComponent } from '@yfiles/yfiles'
        const gc: GraphComponent = {} as any
      `,
        { overwrite: true }
      )
      const gcNode = sourceFile.getVariableDeclaration('gc')!
      assert.strictEqual(checkIfYfiles(gcNode), true)
    })

    it('should recognize yfiles types from local paths', () => {
      const sourceFile = project.createSourceFile(
        'test3.ts',
        `
        import { GraphComponent } from './node_modules/yfiles/yfiles.js'
        const gc: GraphComponent = {} as any
      `,
        { overwrite: true }
      )
      const gcNode = sourceFile.getVariableDeclaration('gc')!
      const originalGetType = gcNode.getType
      gcNode.getType = () => ({
        getText: () => 'import("C:/path/to/yfiles/yfiles.js").GraphComponent',
        getBaseTypes: () => []
      }) as any
      assert.strictEqual(checkIfYfiles(gcNode), true)
      gcNode.getType = originalGetType
    })

    it('should not recognize non-yfiles types', () => {
      const sourceFile = project.createSourceFile(
        'test4.ts',
        `
        class MyClass {}
        const mc: MyClass = {} as any
      `,
        { overwrite: true }
      )
      const mcNode = sourceFile.getVariableDeclaration('mc')!
      assert.strictEqual(checkIfYfiles(mcNode), false)
    })

    it('should recognize types inheriting from yfiles classes', () => {
        const sourceFile = project.createSourceFile(
          'test5.ts',
          `
          import { GraphComponent } from '@yfiles/yfiles'
          class MyGC extends GraphComponent {}
          const mgc: MyGC = {} as any
        `,
          { overwrite: true }
        )
        const mgcNode = sourceFile.getVariableDeclaration('mgc')!
        assert.strictEqual(checkIfYfiles(mgcNode), true)
      })
  })

  describe('isBaseClassYfiles', () => {
    it('should return true for classes inheriting from yfiles classes', () => {
      const sourceFile = project.createSourceFile(
        'test6.ts',
        `
        import { GraphComponent } from '@yfiles/yfiles'
        class MyGC extends GraphComponent {}
        const mgc: MyGC = {} as any
      `,
        { overwrite: true }
      )
      const mgcNode = sourceFile.getVariableDeclaration('mgc')!
      assert.strictEqual(isBaseClassYfiles(mgcNode), true)
    })

    it('should return false for classes not inheriting from yfiles classes', () => {
      const sourceFile = project.createSourceFile(
        'test7.ts',
        `
        class Base {}
        class Derived extends Base {}
        const d: Derived = {} as any
      `,
        { overwrite: true }
      )
      const dNode = sourceFile.getVariableDeclaration('d')!
      assert.strictEqual(isBaseClassYfiles(dNode), false)
    })
  })

  describe('getType', () => {
    it('should return "number" for numeric literals', () => {
      const sourceFile = project.createSourceFile('test8.ts', 'const a = 1', { overwrite: true })
      const node = sourceFile.getVariableDeclaration('a')!.getInitializer()!
      assert.strictEqual(getType(node), 'number')
    })

    it('should return "string" for string literals', () => {
      const sourceFile = project.createSourceFile('test9.ts', 'const a = "hello"', { overwrite: true })
      const node = sourceFile.getVariableDeclaration('a')!.getInitializer()!
      assert.strictEqual(getType(node), 'string')
    })

    it('should return "boolean" for true/false', () => {
      const sourceFile = project.createSourceFile('test10.ts', 'const a = true; const b = false', { overwrite: true })
      const aNode = sourceFile.getVariableDeclaration('a')!.getInitializer()!
      const bNode = sourceFile.getVariableDeclaration('b')!.getInitializer()!
      assert.strictEqual(getType(aNode), 'boolean')
      assert.strictEqual(getType(bNode), 'boolean')
    })
  })

  describe('matchType', () => {
    it('should match basic types', () => {
      setGlobalProject(project, false)
      const sourceFile = project.createSourceFile('test11.ts', 'const a: string = "hi"', { overwrite: true })
      const node = sourceFile.getVariableDeclaration('a')!
      assert.strictEqual(matchType(node, 'string'), true)
    })

    it('should match yfiles types', () => {
        setGlobalProject(project, false)
        const sourceFile = project.createSourceFile('test12.ts', `
            import { Point } from '@yfiles/yfiles'
            const p: Point = {} as any
        `, { overwrite: true })
        const node = sourceFile.getVariableDeclaration('p')!
        
        // Mock the type to have a symbol that matchType can use
        const originalGetType = node.getType
        node.getType = () => ({
          getSymbol: () => ({ getName: () => 'Point' }),
          getText: () => 'import("@yfiles/yfiles").Point',
          isAssignableTo: () => true,
          getBaseTypes: () => []
        }) as any

        assert.strictEqual(matchType(node, 'Point'), true)
        node.getType = originalGetType
      })
  })

  describe('compareSignature', () => {
    it('should compare simple signatures', () => {
      assert.strictEqual(compareSignature('myFunc', 'myFunc', {}), true)
      assert.strictEqual(compareSignature('myFunc', 'otherFunc', {}), false)
    })

    it('should compare signatures with parameters', () => {
      assert.strictEqual(compareSignature('myFunc(string,number)', 'myFunc(string,number)', {}), true)
      assert.strictEqual(compareSignature('myFunc(string)', 'myFunc(number)', {}), false)
      assert.strictEqual(compareSignature('myFunc(string,number)', 'myFunc(string)', {}), false)
    })

    it('should handle renamed types in signatures', () => {
      const typesRenamedInverse = { 'NewType': 'OldType' }
      assert.strictEqual(compareSignature('myFunc(OldType)', 'myFunc(NewType)', typesRenamedInverse), true)
    })
  })
})
