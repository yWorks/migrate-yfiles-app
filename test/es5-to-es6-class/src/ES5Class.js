/**
 * Lazy Class comment
 */
LazyClass = new yfiles.ClassDefinition(function() {
  return {
    /**
     * Field comment
     */
    $extends: yfiles.drawing.SimpleAbstractNodeStyle,

    $field: 0,
    $anotherField: {
      stuff: 'value'
    },

    /**
     * constructor comment
     */
    constructor: {
      default: function(constructorParam) {
        // inline comment
        yfiles.drawing.SimpleAbstractNodeStyle.call(this, constructorParam)
        console.log('complex constructor')
      },

      AnotherConstructor: function(anotherConstructorParam) {
        console.log('named constructor')
      }
    },

    /**
     * method comment
     */
    getIntersection: function(node, inner, outer) {
      var otherInner = 'otherInner'
      const result = LazyClass.$super.getIntersection.call(this, node, otherInner, outer)
      return result
    },

    method: function(param, anotherParam) {
      return null
    },

    methodWithQuotes: function(a, b, c) {
      console.log('methodWithQuotes')
    },

    /**
     * aProperty comment
     */
    aProperty: {
      get: function() {
        return this.$field
      },
      set: function(/**number*/ value) {
        this.$field = value
      }
    },

    $static: {
      /**
       * Static field comment
       */
      STATIC_FIELD: 7,
      /**
       * staticMethod comment
       */
      staticMethod: function(param) {
        console.log('static method body')
      },
      /**
       * staticGetterSetter comment
       */
      get staticGetterSetter() {
        return 7
      },
      set staticGetterSetter(value) {
        console.log('static setter')
      },
      /**
       * clinit comment
       */
      $clinit: function() {
        LazyClass.STATIC_FIELD++
        console.log('more statements')
      }
    }
  }
})

/**
 * VariableLazyClass comment
 */
var VariableLazyClass = new yfiles.ClassDefinition(function() {
  return {
    $extends: yfiles.drawing.SimpleAbstractNodeStyle,
    constructor: function(foo, bar) {
      yfiles.drawing.SimpleAbstractNodeStyle.call(this, foo, bar)
      console.log('simple constructor')
    }
  }
})

/**
 * MemberLazyClass comment
 */
exports.MemberLazyClass = new yfiles.ClassDefinition(function() {
  return {
    $extends: Object
  }
})

exports.nested.NestedMemberLazyClass = new yfiles.ClassDefinition(function() {
  return {
    $static: {
      STATIC_FIELD: 9,
      $clinit: function() {
        exports.nested.NestedMemberLazyClass.STATIC_FIELD--
      }
    }
  }
})

/**
 * NonLazy comment
 */
NonLazyClass = yfiles.lang.Class('NonLazyClass', {
  $extends: Object,
  $with: [yfiles.graph.ILookup, yfiles.input.IHitTestable],

  $value: 7,

  lookup: function(type) {
    return null
  },

  isHit: function(context, location) {
    return false
  },

  /**
   * simpleGetter comment
   */
  get simpleGetter() {
    return this.$value
  },

  /**
   * simpleSetter comment
   */
  set simpleSetter(value) {
    this.$value = value
  }
})

/**
 * Don't migrate classes that use $meta
 */
var ClassWithMeta = yfiles.lang.Class('ClassWithMeta', {
  constructor: {
    $meta: [],
    value: function() {}
  },
  firstName: {
    $meta: [FormTypeAttribute('text')],
    value: ''
  }
})

var AnotherNonLazyClass = yfiles.lang.Class('AnotherNonLazyClass', {})
exports.AnotherNonLazyClass = yfiles.lang.Class('AnotherNonLazyClass', {})
