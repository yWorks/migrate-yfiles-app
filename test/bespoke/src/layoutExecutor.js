// The old migration tool did not adapt the constructor call and insterted
// a comment about finishHandler being removed.
var layoutExecutor = new yfiles.graph.LayoutExecutor.FromControlAndLayouter(graphControl, myLayout);
layoutExecutor.finishHandler = function(sender, args) {console.log("done")}.bind(this);
var someLineInBetween = 'foo'
layoutExecutor.start();
