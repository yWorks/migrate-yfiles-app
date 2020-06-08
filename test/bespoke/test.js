const prepareTests = require('../test-runner')
const path = require('path')
const sinon = require('sinon')
const assert = require('assert').strict

const tests = prepareTests(__dirname)
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

  it('logs "GraphBuilders have been replaced"', () => {
    const consoleOutput = log.getCalls().map(call => call.args.join("")).join("\n")
    assert.equal(consoleOutput.match(/The .*[^s]GraphBuilder.* class has been replaced/g).length, 2)
    assert.equal(consoleOutput.match(/The .*TreeBuilder.* class has been replaced/g).length, 2)
    assert.equal(consoleOutput.match(/The .*AdjacentNodesGraphBuilder.* class has been replaced/g).length, 2)
  })
})
