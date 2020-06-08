import { LayoutExecutor } from "yfiles";
// The old migration tool did not adapt the constructor call and insterted
// a comment about finishHandler being removed.
const layoutExecutor = new LayoutExecutor(graphControl, myLayout);
const someLineInBetween = 'foo';
layoutExecutor.start().then((sender, args) => {console.log("done")});
