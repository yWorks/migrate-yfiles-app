const prepareTests = require('../test-runner')
const sinon = require('sinon')
const assert = require('assert').strict
const path = require('path')

const tests = prepareTests(__dirname, { incremental: true, verbose: false })

let log
describe(path.basename(__dirname), () => {
  before(() => {
    log = sinon.spy(console, 'log')
  })

  after(() => {
    console.log.restore()
  })

  for(let [name, fn] of Object.entries(tests)) {
    it(name, fn)
  }

  it ('Considers Ignores', async () => {
    assert.ok(!log.called)
  })

})



