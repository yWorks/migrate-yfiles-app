const path = require('path')
const fs = require('fs-extra')
const assert = require('assert').strict

const migrate = require('../src/index')
const AVAILABLE_TRANSFORMS = require('../src/available-transforms')

const DEFAULT_CONFIG = {
  from: '1.3',
  extensions: ['js','ts'],
  transforms: AVAILABLE_TRANSFORMS
}

module.exports = function prepareTests(dir, options = {}) {
  const srcDir = path.join(dir, 'src')
  const generatedDir = path.join(dir, 'generated')
  const destDir = path.join(dir, 'dest')
  fs.emptyDirSync(generatedDir)
  if (options.incremental) {
    fs.copySync(srcDir, generatedDir)
  }
  const config = Object.assign({}, DEFAULT_CONFIG, options)

  const tests = {}

  tests[`runs the migrations on ${dir}`] = async function() {
    this.timeout(0)
    await migrate({
      src: srcDir,
      dest: generatedDir,
      from: config.from,
      transforms: config.transforms,
      extensions: config.extensions,
      incremental: config.incremental,
      verbose: config.verbose
    })
  }

  const filePaths = readAllFilesInDirRecursively(destDir)
  for (const filePath of filePaths) {
    const relativePath = path.relative(destDir, filePath)
    tests[relativePath] = async function() {
      const [destContent, generatedContent] = await Promise.all([
        fs.readFile(filePath, 'utf8'),
        fs.readFile(path.join(generatedDir, relativePath), 'utf8')
      ])
      const destLines = destContent.split(/\r?\n/)
      const generatedLines = generatedContent.split(/\r?\n/)
      if (destLines.length === generatedLines.length) {
        assert.deepEqual(generatedLines, destLines)
      } else {
        assert.equal(generatedContent, destContent)
      }
    }
  }
  return tests
}

function readAllFilesInDirRecursively(dir) {
  const allNames = fs.readdirSync(dir)
  const files = []
  for (const name of allNames) {
    const fullPath = path.join(dir, name)
    const isDir = fs.lstatSync(fullPath).isDirectory()
    if (isDir) {
      files.push(...readAllFilesInDirRecursively(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  return files
}
