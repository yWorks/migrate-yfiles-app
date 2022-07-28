import { LayoutExecutor } from "yfiles";
// The old migration tool did not adapt the constructor call and insterted
// a comment about finishHandler being removed.
var layoutExecutor = new LayoutExecutor(graphControl, myLayout);
var someLineInBetween = 'foo'
layoutExecutor.start().then(function(sender, args) {console.log("done")}.bind(this));
