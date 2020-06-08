/**
 * Foo
 * @type {yfiles.ClassDefinition}
 */
var Foo = new yfiles.ClassDefinition(function() {
  return {
    /**
     * createVisual
     * @param item
     * @param context
     */
    'createVisual': function(item, context) {},

    'updateVisual': function(/* itemComment */item, /* contextComment */context, oldVisual) {}
  }
})

/**
 * Foo2
 * @type {ClassExpression | ClassDeclaration}
 */
var Foo2 = new yfiles.lang.Class('Foo2', {
  createVisual: function(/*itemComment*/item, /*contextComment*/context) {},

  /**
   * updateVisual
   * @param item
   * @param context
   * @param oldVisual
   */
  updateVisual: function(item, context, oldVisual) {}
})
