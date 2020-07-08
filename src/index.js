const debug = require('debug')('migrate-yfiles-app:CLI')
const path = require('path')
const fs = require('fs-extra')
const { spawn } = require('child_process')
const { PassThrough, Transform } = require('stream')

const colors = require('colors/safe')

module.exports = async function migrate({
  src,
  dest,
  from,
  singleline,
  nocolor,
  transforms,
  extensions,
  incremental,
  force,
  verbose,
  ignorePattern
}) {
  const srcExists = fs.existsSync(src)
  const destExists = fs.existsSync(dest)
  const srcIsDir = srcExists && isDir(src)
  const destIsDir = destExists && isDir(dest)
  if (!srcExists) {
    throw new Error('The given source does not exist.')
  }
  if (destExists && !destIsDir) {
    throw new Error('The given destination is not a directory.')
  }
  if (!force && !incremental && destExists && fs.readdirSync(dest).length > 0) {
    throw new Error(
      'The given destination directory is not empty. Use "--force" to proceed anyway, or "--incremental" to just receive warnings.'
    )
  }

  dest = path.resolve(dest)

  if (!incremental) {
    // Copy all source files to their destination folder because jscodeshift does in-place edits
    let sourcePaths
    if (srcIsDir) {
      sourcePaths = await fs.readdir(src)
    } else {
      sourcePaths = [path.basename(src)]
      src = path.dirname(src)
    }
    for (const sourceFile of sourcePaths) {
      await fs.copy(path.join(src, sourceFile), path.join(dest, sourceFile))
    }
  }

  // Check the target platform executable
  let cmd = path.join(__dirname, '../node_modules/.bin/jscodeshift')
  if (process.platform === 'win32') {
    cmd += '.cmd'
  }
  const args = [
    '--extensions',
    extensions.join(','),
    '--transform',
    path.join(__dirname, '../transforms/master-transform.ts'),
    '--from',
    `"${from}"`,
    '--parser=ts',
    '--transforms',
    transforms.join(','),
    '--ignore-pattern',
    ignorePattern,
    dest
  ]
  if (singleline) {
    args.unshift('--singleline')
  }
  if (nocolor) {
    args.unshift('--nocolor')
  }
  if (incremental) {
    args.unshift('--incremental')
  }
  if (verbose) {
    args.unshift('--verbose=2')
  } else {
    args.unshift('--silent')
  }

  const codeshift = spawn(cmd, args)

  let hasError = false

  let i = 0

  codeshift.stdout.on('data', data => {
    const s = data.toString()
    hasError |= / ERR /.test(s)
    console.log(`${s.replace(/[\r\n]+$/, '')}`)
  })

  codeshift.stderr.on('data', data => {
    console.error(data.toString())
  })

  const exitCode = await new Promise(resolve => {
    codeshift.on('close', code => {
      resolve(code)
    })
  })

  if (exitCode !== 0 || hasError) {
    throw new Error('Migration unsuccessful.')
  }
}

function isDir(filePath) {
  return fs.lstatSync(filePath).isDirectory()
}
