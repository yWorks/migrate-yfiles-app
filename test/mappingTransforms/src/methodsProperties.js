function foo(hl) {
  hl.mirrorMask = 5

  return hl.mirrorMask
}

function foo2(map) {
  map.size(4)

  map.size(4,5)

  return map.size()
}
