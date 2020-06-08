const prepareTests = require('../test-runner')
const path = require('path')

const tests = prepareTests(__dirname)
describe(path.basename(__dirname), () => {
  for(let [name, fn] of Object.entries(tests)) {
    it(name, fn)
  }
})

