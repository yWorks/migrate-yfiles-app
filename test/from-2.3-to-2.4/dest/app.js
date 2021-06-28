const gc = new GraphComponent()

const listener = () => {
  console.log('hello')
}
gc.addContentMarginsChangedListener(listener)
gc.removeContentMarginsChangedListener(listener)
gc.contentMargins()
gc.ensureVisible([0, 0, 100, 100])
gc.apply()
