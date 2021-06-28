#!/usr/bin/env node

const migrate = require('./index')
const AVAILABLE_TRANSFORMS = require('./available-transforms')

// All available mappings
const meta = require('../mappings/meta.json')

const requiredGroup = 'Required Arguments'
const optionalGroup = 'Optional Arguments'
const argv = require('yargs')
  .option('from', {
    group: requiredGroup,
    alias: 'f',
    demandOption: true,
    description: 'The version of yFiles for HTML from which to migrate',
    type: 'string',
    choices: meta.versions.slice(0, -1),
  })
  .option('src', {
    group: requiredGroup,
    alias: 's',
    demandOption: true,
    description: 'The input file/directory to be transformed',
    type: 'string',
  })
  .option('dest', {
    group: requiredGroup,
    alias: 'd',
    demandOption: true,
    description: 'The destination directory where all transformed files will be written to',
    type: 'string',
  })
  .option('incremental', {
    group: optionalGroup,
    alias: 'i',
    description: 'Run the migration tool in incremental mode',
    type: 'boolean',
    default: false,
  })
  .option('extensions', {
    group: optionalGroup,
    alias: 'e',
    description: 'Which file extensions to transform',
    type: 'array',
    choices: ['js', 'ts'],
    default: ['js', 'ts'],
  })
  .option('ignore-pattern', {
    group: optionalGroup,
    description: 'Ignore files that match the provided glob expression',
    type: 'string',
    default: '**/node_modules/**',
  })
  .option('singleline', {
    group: optionalGroup,
    alias: 'l',
    description: 'Log output in single lines',
    type: 'boolean',
    default: false,
  })
  .option('force', {
    group: optionalGroup,
    description: 'Overwrite files in the destination directory',
    type: 'boolean',
    default: false,
  })
  .option('nocolor', {
    group: optionalGroup,
    alias: 'nc',
    description: 'Do not colorize the log output',
    type: 'boolean',
    default: false,
  })
  .option('verbose', {
    group: optionalGroup,
    alias: 'v',
    description: 'Log verbose jsdcodeshift messages',
    type: 'boolean',
    default: false,
  })
  .group(['version', 'help'], optionalGroup)
  .option('transforms', {
    group: optionalGroup,
    alias: 't',
    description: 'Which transforms to apply',
    type: 'array',
    choices: AVAILABLE_TRANSFORMS,
    default: AVAILABLE_TRANSFORMS,
  })
  .wrap(require('yargs').terminalWidth())
  .help('help').argv

migrate(argv).catch(e => {
  console.error(e)
})
