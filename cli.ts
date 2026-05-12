#!/usr/bin/env node

import { NewLineKind, Project, QuoteKind } from 'ts-morph'
import { transform } from './src/transformations.js'
import { parseArgs } from 'node:util'
import { red } from 'kolorist'
import type { StatisticsReport } from './src/statisticsReport.js'
import { setGlobalProject } from './src/utils.js'
import { createRequire } from 'node:module'
import path from 'node:path'
import * as fs from 'node:fs'
import { createVueFileSystemHost } from 'vue-ts-morph'

const validFromVersions = ['2.6', '3.0']

const { values } = parseArgs({
  options: {
    configPath: { type: 'string' },
    folderPath: {
      type: 'string'
    },
    experimental: {
      type: 'boolean'
    },
    from: {
      type: 'string',
      default: '2.6'
    },
    vue: {
      type: 'boolean',
      default: false
    }
  }
})

if (values.from && !validFromVersions.includes(values.from)) {
  console.error(
    red(
      `Invalid '--from'-version "${values.from}". This version only supports migrating from: ${validFromVersions.join(', ')}`
    )
  )
  process.exit(1)
}
const fromVersion = (values.from as '2.6' | '3.0') ?? '2.6'
const extensionIncludeList = ['.ts', '.d.ts', '.js', '.tsx', '.jsx', '.vue']
const manipulationSettings = {
  quoteKind: QuoteKind.Single,
  newLineKind:
    process.platform === 'win32' ? NewLineKind.CarriageReturnLineFeed : NewLineKind.LineFeed
}
let requirePath: string
let project: Project
// initialize
//TODO this does not work with composite tsconfigs
if (values.configPath) {
  project = new Project({
    fileSystem: values.vue ? createVueFileSystemHost() : undefined,
    tsConfigFilePath: values.configPath,
    skipAddingFilesFromTsConfig: !!values.folderPath,
    manipulationSettings: manipulationSettings
  })
  requirePath = values.configPath
} else if (values.folderPath) {
  if (values.vue) {
    throw new Error('In vue mode you must point to a tsconfig to allow for proper type resolution')
  }
  requirePath = values.folderPath
  project = new Project({
    manipulationSettings: manipulationSettings
  })
  project.addSourceFilesAtPaths([
    `${values.folderPath}/**`,
    `!${values.folderPath}/**/node_modules/**`
  ])
} else {
  throw new Error(
    'No source provided, use the \'configPath\' or \'folderPath\' option to supply source files)'
  )
}

setGlobalProject(project, true)

let statisticsReports: StatisticsReport[] = []
let fileModificationCount = 0
const sourceFiles = project.getSourceFiles()
let installedYfiles_below3_0
let installedYfiles_above3_0
try {
  installedYfiles_below3_0 = JSON.parse(fs.readFileSync(createRequire(path.resolve(requirePath)).resolve('yfiles').replace('yfiles.js', 'package.json'), 'utf-8'))['version']
} catch (e: any) {
  if (fromVersion == '2.6') {
    throw new Error('From version is 2.6, but no 2.6 yFiles version is installed. Please install yFiles 2.6.')
  }
}
try {
  installedYfiles_above3_0 = JSON.parse(fs.readFileSync(createRequire(path.resolve(requirePath)).resolve('@yfiles/yfiles').replace('yfiles.js', 'package.json'), 'utf-8'))['version']
} catch (e: any) {
  if (fromVersion == '3.0') {
    throw new Error(`From version is ${fromVersion}, but no ${fromVersion} yFiles version is installed. Please install yFiles ${fromVersion}.`)
  }
}
if (installedYfiles_below3_0 && installedYfiles_above3_0) {
  if (installedYfiles_below3_0.startsWith(fromVersion.replace('.', ''))) {
    console.log(
      red(
        `You specified --from=${fromVersion}. But both: ${installedYfiles_above3_0} and ${installedYfiles_below3_0} are installed. Make sure you import from ${installedYfiles_below3_0}.`
      )
    )
  } else if (
    installedYfiles_above3_0.startsWith(fromVersion.replace('.', '')) ||
    (fromVersion === '3.0' && installedYfiles_above3_0.startsWith('30'))
  ) {
    console.log(
      red(
        `You specified --from=${fromVersion}. But both: ${installedYfiles_above3_0} and ${installedYfiles_below3_0} are installed. Make sure you import from ${installedYfiles_above3_0}.`
      )
    )
  } else {
    throw new Error(
      `You specified --from=${fromVersion}. But neither of the installed yFiles versions (${installedYfiles_below3_0}, ${installedYfiles_above3_0}) matches this`
    )
  }
} else {
  if (
    installedYfiles_below3_0 &&
    !installedYfiles_below3_0.startsWith(fromVersion.replace('.', ''))
  ) {
    throw new Error(
      `You specified from version ${fromVersion} but yfiles (semver) version ${installedYfiles_below3_0} is installed`
    )
  } else if (
    installedYfiles_above3_0 &&
    !installedYfiles_above3_0.startsWith(fromVersion.replace('.', '')) &&
    !(fromVersion === '3.0' && installedYfiles_above3_0.startsWith('30'))
  ) {
    throw new Error(
      `You specified from version ${fromVersion} but yfiles (semver) version ${installedYfiles_above3_0} is installed`
    )
  }
}

const saveOps = []
for (const sourceFile of sourceFiles) {
  if (sourceFile.getBaseName() === 'yfiles.d.ts') {
    continue
  }
  if (!extensionIncludeList.includes(sourceFile.getExtension())) {
    continue
  }

  console.log(`Working on ${sourceFile.getFilePath()}`)
  const report = transform(sourceFile, values.experimental, fromVersion)
  statisticsReports.push(report)
  const changeCount = report.getTotalChanges()
  if (changeCount > 0) {
    fileModificationCount++
    console.log(`Applied ${changeCount} changes`)
    saveOps.push(sourceFile)
  }
}
for (const sourceFile of saveOps) {
  await sourceFile.save()
}
console.log(`Changed ${fileModificationCount} of ${project.getSourceFiles().length} files`)
