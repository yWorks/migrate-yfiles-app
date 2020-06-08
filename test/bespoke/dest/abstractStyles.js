import { Class } from "yfiles";
/**
 * Foo
 * @type {yfiles.ClassDefinition}
 */
class Foo {
 /**
  * createVisual
  * @param item
  * @param context
  */
 createVisual(context, item) {}

 updateVisual(/* contextComment */context, oldVisual, /* itemComment */item) {}
}

/**
 * Foo2
 * @type {ClassExpression | ClassDeclaration}
 */
const Foo2 = new Class('Foo2', {
  createVisual: function(/*contextComment*/context, /*itemComment*/item) {},

  /**
   * updateVisual
   * @param item
   * @param context
   * @param oldVisual
   */
  updateVisual: function(context, oldVisual, item) {}
});
