import { hasConflictingRegistration } from 'jscodeshift/src/Collection'
import { MIGRATIONS_FOR_VERSION } from './util'
import { fromPaths } from 'jscodeshift/dist/Collection'

import { doTransform as memberRenamings } from './memberRenamings'
import { doTransform as namespaceChanges } from './namespaceChanges'
import { doTransform as propertyTypeChanges } from './propertyTypeChanges'
import { doTransform as removedMembers } from './removedMembers'
import { doTransform as removedTypes } from './removedTypes'
import { doTransform as signatureChanges } from './signatureChanges'
import { doTransform as returnTypeChanges } from './returnTypeChanges'
import { doTransform as methodsProperties } from './methodsProperties'

import { doTransform as transformToModule } from './UMD-to-ES-modules'
import { doTransform as toEs6Class } from './toEs6Class'
import { doTransform as customTransform } from './custom-transform'

import noVars from 'js-codemod/transforms/no-vars'
import arrowFunctions from 'js-codemod/transforms/arrow-function'

const debug = require('debug')('migrate-yfiles-app:transformer')

const allTransforms = [
  // these use mappings
  { name: 'namespaceChanges', fn: namespaceChanges, needsMappings: true },
  { name: 'signatureChanges', fn: signatureChanges, needsMappings: true },
  { name: 'methodsProperties', fn: methodsProperties, needsMappings: true },
  { name: 'memberRenamings', fn: memberRenamings, needsMappings: true },

  // these come from third parties
  { name: 'replace-vars', fn: noVars, external: true },
  { name: 'arrow-functions', fn: arrowFunctions, external: true },

  // these only refactor code
  { name: 'toEs6Class', fn: toEs6Class },
  { name: 'transformToModule', fn: transformToModule },
  { name: 'customTransform', fn: customTransform },

  // these only produce warnings and need mappings
  // these have to run last, otherwise the line/column numbers are off
  { name: 'returnTypeChanges', fn: returnTypeChanges, needsMappings: true },
  { name: 'removedMembers', fn: removedMembers, needsMappings: true },
  { name: 'removedTypes', fn: removedTypes, needsMappings: true },
  { name: 'propertyTypeChanges', fn: propertyTypeChanges, needsMappings: true },
  // these have already run, but need to run a second time to output warnings
  // has to happen here to that line/column numbers are correct
  { name: 'signatureChanges', fn: signatureChanges, needsMappings: true, secondPass: true },
  { name: 'memberRenamings', fn: memberRenamings, needsMappings: true, secondPass: true },
]

export interface Options {
  incremental: boolean
  singleline: boolean
  nocolor: boolean
  transforms: string
  from: string
}

export default function transformer(file, api, options: Options) {
  const j = api.jscodeshift

  if (!hasConflictingRegistration('findObjectMembers')) {
    j.registerMethods({
      findObjectMembers(filter) {
        const c1 = this.find(j.ObjectProperty, filter)
        const c2 = this.find(j.ObjectMethod, filter)
        const c3 = this.find(j.ClassMethod, filter)
        return fromPaths(c1.paths().concat(c2.paths(), c3.paths()))
      },
    })
  }

  let sources = j(file.source)
  let stringSource = null
  const transforms = options.transforms.split(',')

  for (const { name, fn, needsMappings, external, secondPass } of allTransforms) {
    const tryApplyTransform = (fn, ...args) => {
      debug(`Running transform '${name}' on ${file.path}`)
      try {
        return fn(...args)
      } catch (e) {
        console.error(`Could not apply transform ${name} to ${file.path}: ${e.message}`)
        e.stack && console.log(e.stack)
      }
      return null
    }

    if (!transforms.includes(name)) {
      debug(`Skipping transform '${name}'`)
      continue
    }
    if (external) {
      if (options.incremental) {
        debug(`Skipping external transform '${name}' due to incremental mode`)
        continue
      }
      if (typeof stringSource !== 'string') {
        stringSource = sources.toSource()
        sources = null
      }
      stringSource =
        tryApplyTransform(fn, { path: file.path, source: stringSource }, api, options) ||
        stringSource
    } else {
      if (!sources) {
        sources = j(stringSource)
        stringSource = null
      }
      if (needsMappings) {
        for (const { mappings, from, to } of MIGRATIONS_FOR_VERSION[options.from]) {
          sources =
            tryApplyTransform(fn, {
              api,
              ast: sources,
              filePath: file.path,
              mappings,
              from,
              to,
              options,
              secondPass,
            }) || sources
        }
      } else {
        sources =
          tryApplyTransform(fn, { api, ast: sources, filePath: file.path, options }) || sources
      }
    }
  }

  if (typeof stringSource !== 'string') {
    stringSource = sources.toSource()
  }

  if (!options.incremental) {
    // ensure we have the same line endings as the source file
    const windowsLineEndings = /\r\n/.test(file.source)
    stringSource = stringSource.replace(/\r?\n/g, windowsLineEndings ? '\r\n' : '\n')
  }

  return stringSource
}
