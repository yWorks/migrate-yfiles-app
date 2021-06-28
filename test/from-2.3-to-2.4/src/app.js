const gc = new GraphComponent()

const listener = () => {
  console.log('hello')
}
gc.addFitContentViewMarginsChangedListener(listener)
gc.removeFitContentViewMarginsChangedListener(listener)
gc.fitContentViewMargins()
gc.ensureVisible([0, 0, 100, 100])
gc.apply()
