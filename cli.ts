import { NewLineKind, Project, QuoteKind } from 'ts-morph'
import { transform } from './src/transformations.js'
import { parseArgs } from 'node:util'
import type { StatisticsReport } from './src/statisticsReport.js'
import { setGlobalProject } from './src/utils.js'

const { values } = parseArgs({
  options: {
    configPath: { type: 'string' },
    folderPath: {
      type: 'string'
    },
    experimental: {
      type: 'boolean'
    },
    target: {
      type: 'string',
      default: 'default' as const
    }
  }
})
const extensionIncludeList = ['.ts', '.js', '.tsx', '.jsx', '.vue']
const manipulationSettings = {
  quoteKind: QuoteKind.Single,
  newLineKind:
    process.platform === 'win32' ? NewLineKind.CarriageReturnLineFeed : NewLineKind.LineFeed
}
let project: Project
// initialize
//TODO this does not work with composite tsconfigs
if (values.configPath) {
  project = new Project({
    tsConfigFilePath: values.configPath,
    skipAddingFilesFromTsConfig: !!values.folderPath,
    manipulationSettings: manipulationSettings
  })
} else if (values.folderPath) {
  project = new Project({
    manipulationSettings: manipulationSettings
  })
  project.addSourceFilesAtPaths([
    `${values.folderPath}/**`,
    `!${values.folderPath}/**/node_modules/**`
  ])
} else {
  throw new Error(
    "No source provided, use the 'config' or 'filePath' option to supply source file)"
  )
}

setGlobalProject(project, true)

let statisticsReports: StatisticsReport[] = []
let fileModificationCount = 0
const sourceFiles = project.getSourceFiles()
for (const sourceFile of sourceFiles) {
  if (sourceFile.getBaseName() === 'yfiles.d.ts') {
    continue
  }
  if (!extensionIncludeList.includes(sourceFile.getExtension())) {
    continue
  }

  console.log(`Working on ${sourceFile.getFilePath()}`)
  const report = transform(sourceFile, values.experimental, values.target)
  statisticsReports.push(report)
  const changeCount = report.getTotalChanges()
  if (changeCount > 0) {
    fileModificationCount++
    console.log(`Applied ${changeCount} changes`)
  }

  await sourceFile.save()
}

console.log(`Changed ${fileModificationCount} of ${project.getSourceFiles().length} files`)
