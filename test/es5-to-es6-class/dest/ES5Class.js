import { Class, IHitTestable, ILookup, NodeStyleBase } from "yfiles";
import { BaseClass } from "yfiles";

/**
 * Lazy Class comment
 */
class LazyClass extends NodeStyleBase {
  static AnotherConstructor(anotherConstructorParam) {
    throw new Error("Migrate named constructor AnotherConstructor!");
    console.log('named constructor')
  }

  constructor(constructorParam) {
    // inline comment
    super(constructorParam)
    this.$field = 0;

    this.$anotherField = {
      stuff: 'value'
    };

    console.log('complex constructor')
  }

  /**
   * method comment
   */
  getIntersection(node, inner, outer) {
    const otherInner = 'otherInner';
    const result = super.getIntersection(node, otherInner, outer)
    return result
  }

  method(param, anotherParam) {
    return null
  }

  methodWithQuotes(a, b, c) {
    console.log('methodWithQuotes')
  }

  /**
   * aProperty comment
   */
  get aProperty() {
    return this.$field
  }

  /**
   * aProperty comment
   */
  set aProperty(/**number*/ value) {
    this.$field = value
  }

  /**
   * staticMethod comment
   */
  static staticMethod(param) {
    console.log('static method body')
  }

  /**
   * staticGetterSetter comment
   */
  static get staticGetterSetter() {
    return 7
  }

  static set staticGetterSetter(value) {
    console.log('static setter')
  }
}

/**
 * Static field comment
 */
LazyClass.STATIC_FIELD = 7;

/**
 * clinit comment
 */
{
  LazyClass.STATIC_FIELD++
  console.log('more statements')
}

/**
 * VariableLazyClass comment
 */
class VariableLazyClass extends NodeStyleBase {
  constructor(foo, bar) {
    super(foo, bar)
    console.log('simple constructor')
  }
}

/**
 * MemberLazyClass comment
 */
exports.MemberLazyClass = class MemberLazyClass extends Object {};

exports.nested.NestedMemberLazyClass = class NestedMemberLazyClass {};
NestedMemberLazyClass.STATIC_FIELD = 9;
{
  exports.nested.NestedMemberLazyClass.STATIC_FIELD--
}

/**
 * NonLazy comment
 */
class NonLazyClass extends BaseClass(Object, ILookup, IHitTestable) {
  constructor() {
    super();
    this.$value = 7;
  }

  lookup(type) {
    return null
  }

  isHit(context, location) {
    return false
  }

  /**
   * simpleGetter comment
   */
  get simpleGetter() {
    return this.$value
  }

  /**
   * simpleSetter comment
   */
  set simpleSetter(value) {
    this.$value = value
  }
}

/**
 * Don't migrate classes that use $meta
 */
const ClassWithMeta = Class('ClassWithMeta', {
  constructor: {
    $meta: [],
    value: function() {}
  },
  firstName: {
    $meta: [FormTypeAttribute('text')],
    value: ''
  }
});

class AnotherNonLazyClass {}
exports.AnotherNonLazyClass = class AnotherNonLazyClass {};
