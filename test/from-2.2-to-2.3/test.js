const prepareTests = require('../test-runner')
const sinon = require('sinon')
const assert = require('assert').strict
const path = require('path')

const tests = prepareTests(__dirname, { from: '2.2' })

let log
describe(path.basename(__dirname), () => {
  before(() => {
    log = sinon.spy(console, 'log')
  })

  after(() => {
    console.log.restore()
  })

  for (let [name, fn] of Object.entries(tests)) {
    it(name, fn)
  }

  it("Doesn't log bespoke < 2.0 stuff", async () => {
    assert.ok(!log.getCalls().some(call => call.args.some(a => a.includes('2.0'))))
  })
})
