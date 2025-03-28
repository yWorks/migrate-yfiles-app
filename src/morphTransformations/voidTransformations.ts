import { Identifier, type SourceFile, SyntaxKind } from 'ts-morph'
import { type ITransformation, replaceWithTextTryCatch } from '../utils.js'
import type { StatisticsReport } from '../statisticsReport.js'

export class VoidTransformations implements ITransformation {
  sourceFile: SourceFile
  statisticsReporting: StatisticsReport
  voids: { [key: string]: { import: string; singleton: string } } = {
    VoidNodeStyle: { import: 'INodeStyle', singleton: 'VOID_NODE_STYLE' },
    VoidEdgeStyle: { import: 'IEdgeStyle', singleton: 'VOID_EDGE_STYLE' },
    VoidLabelStyle: { import: 'ILabelStyle', singleton: 'VOID_LABEL_STYLE' },
    VoidPortStyle: { import: 'IPortStyle', singleton: 'VOID_PORT_STYLE' },
    VoidStripeStyle: { import: 'IStripeStyle', singleton: 'VOID_STRIPE_STYLE' },
    VoidShapeGeometry: { import: 'INodeStyle', singleton: 'VOID_SHAPE_GEOMETRY' },
    VoidPathGeometry: { import: 'INodeStyle', singleton: 'VOID_PATH_GEOMETRY' }
  }

  constructor(sourceFile: SourceFile, statisticsReporting: StatisticsReport) {
    this.sourceFile = sourceFile
    this.statisticsReporting = statisticsReporting
  }

  transform(): void
  transform(identifier: Identifier): void
  transform(identifier?: Identifier): void {
    if (!identifier || identifier?.wasForgotten()) {
      return
    }
    const name = identifier.getText()
    if (
      !identifier.getParent().isKind(SyntaxKind.ImportSpecifier) &&
      Object.hasOwn(this.voids, name)
    ) {
      const voidElem = this.voids[name]
      const parent = identifier?.getParent()
      if(parent?.isKind(SyntaxKind.BinaryExpression)){
        // instanceOf case
        replaceWithTextTryCatch(identifier, `${voidElem.import}.${voidElem.singleton}`)
      }else if(parent?.isKind(SyntaxKind.PropertyAccessExpression)){
        // .INSTANCE case
        replaceWithTextTryCatch(identifier.getParent(), `${voidElem.import}.${voidElem.singleton}`)
      }
      //TODO does this work for variations of importing yfiles?
      const yFilesImport = this.sourceFile.getImportDeclaration((i) => {
        return i.getModuleSpecifierValue().includes('yfiles')
      })
      if (yFilesImport) {
        if (
          !yFilesImport
            .getNamedImports()
            .some((importSpecifier) => importSpecifier.getText() == voidElem.import)
        ) {
          yFilesImport.addNamedImport(voidElem.import)
        }
      }
      this.statisticsReporting.addChangeCount('voidTransforms', 1)
    }
    return
  }
}
