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

const validFromVersions = ['2.6', 'EAP1', 'EAP2']

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
      default: '2.6' as const
    },
    vue:{
      type: 'boolean',
      default: false
    }
  }
})
if (!validFromVersions.includes(values.from)) {
  throw new Error(`Invalid '--from'-version. This version only supports migrating from ${validFromVersions.join(', ')}`)
}
const extensionIncludeList = ['.ts', '.js', '.tsx', '.jsx', '.vue']
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
    fileSystem: values.vue ? createVueFileSystemHost(): undefined,
    tsConfigFilePath: values.configPath,
    skipAddingFilesFromTsConfig: !!values.folderPath,
    manipulationSettings: manipulationSettings
  })
  requirePath = values.configPath
} else if (values.folderPath) {
  requirePath = values.folderPath
  project = new Project({
    fileSystem: values.vue ? createVueFileSystemHost(): undefined,
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
  if (values.from == '2.6') {
    throw new Error('From version is 2.6, but no 2.6 yFiles version is installed. Please install yFiles 2.6.')
  }
}
try {
  installedYfiles_above3_0 = JSON.parse(fs.readFileSync(createRequire(path.resolve(requirePath)).resolve('@yfiles/yfiles').replace('yfiles.js', 'package.json'), 'utf-8'))['version']
} catch (e: any) {
  if (values.from == 'EAP1' || values.from == 'EAP2') {
    throw new Error(`From version is ${values.from}, but no ${values.from} yFiles version is installed. Please install yFiles ${values.from}.`)
  }
}
if ((installedYfiles_below3_0 && installedYfiles_above3_0)) {
  if (installedYfiles_below3_0.startsWith(values.from.replace('.', ''))) {
    console.log(red(`You specified --from=${values.from}. But both: ${installedYfiles_above3_0} and ${installedYfiles_below3_0} are installed. Make sure you import from ${installedYfiles_below3_0}.`))
  } else if (installedYfiles_above3_0.startsWith('30') && installedYfiles_above3_0.includes(values.from)) {
    console.log(red(`You specified --from=${values.from}. But both: ${installedYfiles_below3_0} and ${installedYfiles_above3_0} are installed. Make sure you import from ${installedYfiles_above3_0}.`))
  } else {
    throw new Error(`You specified --from=${values.from}. But neither of the installed yFiles versions (${installedYfiles_below3_0}, ${installedYfiles_above3_0}) matches this`)
  }
} else {
  if (installedYfiles_below3_0 && !installedYfiles_below3_0.startsWith(values.from.replace('.', ''))) {
    throw new Error(`You specified from version ${values.from} but yfiles (semver) version ${installedYfiles_below3_0} is installed`)
  } else if (installedYfiles_above3_0 && (!installedYfiles_above3_0.startsWith('30') || !installedYfiles_above3_0.includes(values.from))) {
    throw new Error(`You specified from version ${values.from} but yfiles (semver) version ${installedYfiles_above3_0} is installed`)
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
  const report = transform(sourceFile, values.experimental, values.from)
  statisticsReports.push(report)
  const changeCount = report.getTotalChanges()
  if (changeCount > 0) {
    fileModificationCount++
    console.log(`Applied ${changeCount} changes`)
  }

  saveOps.push(sourceFile)
}
for (const sourceFile of saveOps) {
  await  sourceFile.save()
}
console.log(`Changed ${fileModificationCount} of ${project.getSourceFiles().length} files`)
