const prepareTests = require('../test-runner')
const path = require('path')
const sinon = require("sinon");
const {strict: assert} = require("assert");

let log
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

    it('logs "Exception.cause has been removed"', () => {
        const consoleOutput = log.getCalls().map(call => call.args.join("")).join("\n")
        assert.ok(/HoveredItemChangedEventArgs\.item/.test(consoleOutput))
        assert.ok(/ has been changed to/.test(consoleOutput))
        assert.ok(/yfiles.graph.IModelItem | null/.test(consoleOutput))
    })
})

