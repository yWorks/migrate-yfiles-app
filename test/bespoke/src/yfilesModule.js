yfiles.module("demo", function(exports) {
  exports.MyClass = new yfiles.ClassDefinition(function() {
    return {
      blub: 'blob'
    }
  })

  exports.MySecondClass = new yfiles.ClassDefinition(function() {
    return {
      blab: 'bleb'
    }
  })
})

yfiles.module('globalModule', function(exports) {
  exports.GlobalClass = new yfiles.ClassDefinition(function() {
    return {
      IAmAvailableGlobally: true
    }
  })
})

var demo = yfiles.module("demo")

var d = new demo.MyClass()

console.log(d.blub)

var globalThing = new globalModule.GlobalClass()

console.log(globalThing.IAmAvailableGlobally)
