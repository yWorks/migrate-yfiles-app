const prepareTests = require('../test-runner')
const path = require('path')
const {strict: assert} = require('assert')
const sinon = require('sinon')

let log
const tests = prepareTests(__dirname)
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

  it('logs "CanvasComponent parameter has been removed"', () => {
    const consoleOutput = log.getCalls().map(call => call.args.join("")).join("\n")
    assert.ok(/CanvasComponent parameter has been removed/.test(consoleOutput))
  })

  it('logs "selectionModel and model constructor parameters have been removed"', () => {
    const consoleOutput = log.getCalls().map(call => call.args.join("")).join("\n")
    assert.ok(/selectionModel and model parameters/.test(consoleOutput))
  })

  it('logs "selectionModel constructor parameter has been removed"', () => {
    const consoleOutput = log.getCalls().map(call => call.args.join("")).join("\n")
    assert.ok(/selectionModel parameter/.test(consoleOutput))
    assert.ok(/has been removed from the HighlightIndicatorManager constructor/.test(consoleOutput))
  })
})
