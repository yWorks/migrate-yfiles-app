const prepareTests = require('../test-runner')
const path = require('path')
const {strict: assert} = require('assert')
const sinon = require('sinon')

let log
const tests = prepareTests(__dirname, { from: '2.5' })
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

    it('logs "Exception.cause has been removed"', () => {
        const consoleOutput = log.getCalls().map(call => call.args.join("")).join("\n")
        assert.ok(/Exception\.cause/.test(consoleOutput))
        assert.ok(/has been removed/.test(consoleOutput))
    })

    it('logs "YObject.referenceEquals has been removed"', () => {
        const consoleOutput = log.getCalls().map(call => call.args.join("")).join("\n")
        assert.ok(/Object\.referenceEquals/.test(consoleOutput))
        assert.ok(/has been removed/.test(consoleOutput))
    })
})
