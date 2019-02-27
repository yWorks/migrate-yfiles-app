/*

A tool that migrates yFiles HTML 1.3 code to 2.0.

Depends on a two config files located in lib/:
 - yfilesDef.js: A JavaScript file exporting the yFiles for HTML 1.3 API in TernJs format
   (see http://ternjs.net/doc/manual.html)
 - changes.json: A set of changes of the 2.0 API. It uses this format:
    {
      "<TransformationType>": {
        "old.name1": <changes>
      },
      "<TransformationType>": {
        "old.type": {
          "oldMemberName": <changes>
        }
      }
    }

   Available TransformationTypes:
    "signatureChanges": Changes the signature of a (static or non-static) method. It uses the bottom config format, e.g.
      "foo.bar.MyClass": {
        "myMethod": [1, 0, "number"]
      }
      <changes> is an array of numbers or strings, where numbers represent the index of the respective parameter in the old
        API. Strings are additional parameters and represent the type of the new parameter.

    "methodsProperties": Transforms methods to properties or vice versa. It uses the bottom config format, e.g.
      "foo.bar.MyClass": {
        "myProperty": "method"
        "myMethod": "property"
      }
      <changes> is the target member kind as string (e.g. "property" converts a method to a property

    "compatMethods": Maps removed methods to static methods of a compat Class. E.g.
      "foo.bar.MyClass": {
        "myMethod": "foo.bar.compat.MyClass.myCompatMethod"
      }
      <changes> Maps member names to fully qualified names of the respective compat method.

    "namespaceChanges": Changes the namespace of namespaces or Types. It uses the upper config format, e.g.
      "foo.bar.baz.MyClass": "foo.bar.MyClass"
      "foo.bar": "foo.bar.baz"

    "memberRenamings": Changes the name of a member. E.g.
      "foo.bar.MyClass": {
        "myMember: "myMemberRenamed"
      }

    "removedMembers": Removed members. E.g.
      "foo.bar.MyClass": [
        "myMember0",
        "myMember1"
      }

    "removedTypes": Removed types. E.g.
      ["foo.bar.MyClass0", "foo.bar.MyClass1"]

    "propertyTypeChanges": The type of a field or property has changed. The value of the entry is the new type.
      "foo.bar.MyClass": [
        "myMember0": "number"
      }

    "returnTypeChanges": The return type of a method has changed. Same as for propertyTypeChanges.

    Additionally all Named Constructors are removed.

   All Transformations use the OLD names as basis. It is possible to have multiple Transformations per member.


New TransformationTypes can be added by extending AbstractTransformation or AbstractMemberTransformation and adding them
to the "transformations" array in module.exports.
 */

var fs = require("fs");
var path = require("path");
var async = require("async");
var mkdirp = require("mkdirp");

var Syntax = require("esprima").Syntax;

var Transformer = require("./transformer");
var AbstractTransformation = Transformer.AbstractTransformation;
var AbstractResolver = Transformer.AbstractResolver;

var encodingOptions = {encoding: "utf-8"};

var commentsCount = 0;

/**
 * Detects member "calls" and overrides and calls {@link AbstractMemberTransformation.prototype.onDetectMember},
 * respectively {@link AbstractMemberTransformation.prototype.onDetectProperty}. Analogously calls
 * {@link AbstractMemberTransformation.prototype.performForProperty} and {@link AbstractMemberTransformation.prototype.performForMember}
 * @param {Object} config
 * @param {String} configEntryName
 * @constructor
 * @extends AbstractTransformation
 */
function AbstractMemberTransformation(config, configEntryName) {
  AbstractTransformation.call(this, config[configEntryName] || {});
}
AbstractMemberTransformation.prototype = Object.create(AbstractTransformation.prototype);
/**
 * @param {String} name
 * @param {String} parentType
 * @param {Node} node
 * @param {Node} parent
 */
AbstractMemberTransformation.prototype.onDetectProperty = function (name, parentType, node, parent) {throw "not implemented"};
/**
 * @param {String} name
 * @param {String} containingType
 * @param {boolean} isUnsafe
 * @param {Node} node
 * @param {Node} parent
 */
AbstractMemberTransformation.prototype.onDetectMember = function (name, containingType, isUnsafe, node, parent) {throw "not implemented"};

/**
 * @param {String} name
 * @param {String} parentType
 * @param {Node} node
 * @param {Node} parent
 */
AbstractMemberTransformation.prototype.performForProperty = function (name, parentType, node, parent) {throw "not implemented"};

/**
 * @param {String} name
 * @param {String} containingType
 * @param {Node} node
 * @param {Node} parent
 */
AbstractMemberTransformation.prototype.performForMember = function (name, containingType, node, parent) {throw "not implemented"};

AbstractMemberTransformation.prototype.detect = function (node, parent, stack) {
  if (node.type !== Syntax.MemberExpression && node.type !== Syntax.Property) {
    return null;
  }

  var transformationTargets = this.transformationTargets;

  if (node.type === Syntax.Property) {
    // member override
    var keyName = getNameOfLiteralOrIdentifier(node.key);
    if (isReservedMember(keyName)) {
      return null;
    }

    // we assume this is a class definition object
    var parentTypes = getParentTypes(parent);

    if (parentTypes.length === 0) {
      return null;
    }

    var parentType = parentTypes.find(function (parentType) {
      return transformationTargets.hasOwnProperty(parentType) && transformationTargets[parentType].hasOwnProperty(keyName);
    });

    if (parentType) {
      return this.onDetectProperty(keyName, parentType, node, parent, stack);
    } else {
      return null;
    }
  } else {
    // member call/usage
    var oldMemberName = getOldMemberName(node);
    var object = node.object;
    var type = object.scopeInfo.type;

    type = getType(type, transformationTargets, oldMemberName, stack);

    if (type.type === "?") {
      return null;
    }

    var containingType = transformationTargets.hasOwnProperty(type.type) && transformationTargets[type.type];

    if (containingType && containingType.hasOwnProperty(oldMemberName)) {
      return this.onDetectMember(oldMemberName, type.type, type.guess, node, parent, stack);
    }
  }

  return null;
};

AbstractMemberTransformation.prototype.perform = function(node, parent, stack) {
  var transformationTargets = this.transformationTargets;

  if (node.type === Syntax.Property) {

    var parentTypes = getParentTypes(parent);

    var oldPropertyName = getNameOfLiteralOrIdentifier(node.key);

    if (isReservedMember(oldPropertyName)) {
      return;
    }

    var parentType = parentTypes.find(function (parentType) {
      return transformationTargets.hasOwnProperty(parentType) && transformationTargets[parentType].hasOwnProperty(oldPropertyName);
    });

    if (parentType) {
      this.performForProperty(oldPropertyName, parentType, node, parent);
    }
  } else {

    var oldMemberName = getOldMemberName(node);
    var type = node.object.scopeInfo.type;

    type = getType(type, transformationTargets, oldMemberName, stack);

    this.performForMember(oldMemberName, type.type, node, parent);
  }
};


/**
 *
 * @param {Node} parent
 * @return {String[]} An array of all types this type either extends or implements
 */
function getParentTypes(parent) {
  var $with = parent.properties.find(function (property) {return getNameOfLiteralOrIdentifier(property.key) === "$with"});
  var $extends = parent.properties.find(function (property) {return getNameOfLiteralOrIdentifier(property.key) === "$extends"});

  return (!$with ? [] : $with.value.type === Syntax.ArrayExpression ? $with.value.elements : [$with.value])
      .concat($extends ? $extends.value : [])
      .map(function (type) {return flattenMemberExpression(type);});
}

/**
 * @param {String} keyName
 * @return {boolean}
 */
function isReservedMember(keyName) {
  return keyName === "$with" || keyName === "$extends" || keyName === "$meta" || keyName === "constructor"
      || keyName === "$static" || keyName === "$clinit";
}

/**
 * @param {Object} config
 * @constructor
 * @extends AbstractMemberTransformation
 */
function MemberRenameTransformation(config) {
  AbstractMemberTransformation.call(this, config, "memberRenamings");
}

MemberRenameTransformation.prototype = Object.create(AbstractMemberTransformation.prototype);
MemberRenameTransformation.prototype.onDetectProperty = function (name, parentType, node, parent) {
  return new AutomaticResolver(this);
};
MemberRenameTransformation.prototype.onDetectMember = function (name, containingType, isUnsafe, node, parent) {
  if (isUnsafe) {
    return new ConfidentCommentResolver(this,
          "'" + memberToString(containingType, name) + "' has been renamed to '" + this.transformationTargets[containingType][name] + "'", true);
  } else {
    return new AutomaticResolver(this);
  }
};

MemberRenameTransformation.prototype.performForProperty = function (name, parentType, node, parent) {
  var newPropertyName = this.transformationTargets[parentType][name];

  if (node.key.type === Syntax.Literal) {
    node.key.value = newPropertyName;
  } else {
    node.key.name = newPropertyName;
  }
};

MemberRenameTransformation.prototype.performForMember = function (name, containingType, node, parent) {
  var newMemberName = this.transformationTargets[containingType][name];
  var property = node.property;

  if (property.type === Syntax.Literal) {
    property.value = newMemberName;
  } else {
    property.name = newMemberName;
  }
};

/**
 * @param {Object} config
 * @constructor
 * @extends AbstractTransformation
 */
function TypeRemovedTransformation(config) {
  AbstractTransformation.call(this, config["removedTypes"] || []);
}
TypeRemovedTransformation.prototype = Object.create(AbstractTransformation.prototype);
TypeRemovedTransformation.prototype.detect = function (node, parent) {
  if (node.type !== Syntax.MemberExpression) {
    return null;
  }

  var type = flattenMemberExpression(node);

  if (this.transformationTargets.indexOf(type) >= 0) {
    return new ImpossibleCommentResolver(this, "Type '" + type + "' has been removed.");
  }
};
TypeRemovedTransformation.prototype.perform = function (node, parent, stack) {};

/**
 * @param {Object} config
 * @constructor
 * @extends AbstractTransformation
 */
function ChangeNamespaceTransformation(config) {
  AbstractTransformation.call(this, config["namespaceChanges"]);
}
ChangeNamespaceTransformation.prototype = Object.create(AbstractTransformation.prototype);

ChangeNamespaceTransformation.prototype.detect = function (node, parent) {
  if (node.type !== Syntax.MemberExpression) {
    return null;
  }

  var namespace = flattenMemberExpression(node);

  if (this.transformationTargets.hasOwnProperty(namespace)) {
    return new AutomaticResolver(this);
  }
};

ChangeNamespaceTransformation.prototype.perform = function (node, parent, stack) {
  var transformationTargets = this.transformationTargets;
  var id = flattenMemberExpression(node);
  var transformationTarget = transformationTargets[id];

  if (!transformationTarget) {
    // this is most probably a nested class
    // -> search for the new namespace of the outer class and retrieve its old namespace

    var nameParts = id.split(".");
    var newNamespace = nameParts.slice(0, -1).join(".");
    var innerClassName = nameParts[nameParts.length - 1];

    var oldNames = Object.getOwnPropertyNames(transformationTargets);
    for (var i = 0; i < oldNames.length; i++) {
      var name = oldNames[i];
      if (transformationTargets[name] === newNamespace) {
        id = name + "." + innerClassName;
        break;
      }
    }

    transformationTarget = transformationTargets[id];
    if (!transformationTarget) {
      return;
    }
  }

  var oldNameStack = transformationTarget.split(".");
  var newMember = oldNameStack.pop();

  if (oldNameStack.length === 0) {
    throw "Wrong mapping for " + id + " to " + transformationTarget + ".";
  }

  if (node.property.type === Syntax.Literal) {
    node.property.value = newMember;
  } else {
    node.property.name = newMember;
  }

  node.object = createMemberExpressionAst(oldNameStack);
};

/**
 * @param {Object} config
 * @constructor
 * @extends AbstractMemberTransformation
 */
function ChangeSignatureTransformation(config) {
  AbstractMemberTransformation.call(this, config, "signatureChanges");
}
ChangeSignatureTransformation.prototype = Object.create(AbstractMemberTransformation.prototype);

ChangeSignatureTransformation.prototype.onDetectProperty = function (name, parentType, node, parent) {
  var oldLength = node.value.params.length;
  var newLength = this.transformationTargets[parentType][name].length;
  if (oldLength < newLength) {
    return new ConfidentCommentResolver(this,
        "The signature of '" + memberToString(parentType, name) + "' has received additional parameters.", false);
  } else if (oldLength > newLength) {
    return new ConfidentCommentResolver(this, "The signature of '" + memberToString(parentType, name) + "' has lost parameters.", false);
  } else {
    return new AutomaticResolver(this);
  }
};

ChangeSignatureTransformation.prototype.onDetectMember = function (name, containingType, isUnsafe, node, parent) {
  if (parent.type !== Syntax.CallExpression && parent.type !== Syntax.NewExpression) {
    if (parent.type === Syntax.MemberExpression) {
      var propertyName = getNameOfLiteralOrIdentifier(parent.property);
      if (propertyName === "call" || propertyName === "apply") {
        return new ImpossibleCommentResolver(this, "The signature of '" + memberToString(containingType, name) + "' has changed");
      }
    }
    return null;
  }

  if (parent.arguments.length < this.transformationTargets[containingType][name].length) {
    return new ConfidentCommentResolver(this,
        "The signature of '" + memberToString(containingType, name) + "' has received additional parameters", true);
  }

  if (isUnsafe) {
    return new ConfidentCommentResolver(this, "The signature of '" + memberToString(containingType, name) + "' has changed", true);
  } else {
    return new AutomaticResolver(this);
  }
};

ChangeSignatureTransformation.prototype.performForProperty = function (name, parentType, node, parent) {
  var oldLength = node.value.params.length;
  var newLength = this.transformationTargets[parentType][name].length;

  var oldParams = node.value.params;
  var argumentMappings = this.transformationTargets[parentType][name];

  var usedNames = oldParams.map(function (p) {return p.name});
  function createNewParameter() {
    var index = 0;
    var name;
    do {
      name = "arg" + index++;
    } while (usedNames.indexOf(name) >= 0);

    usedNames.push(name);

    return {
      type: Syntax.Identifier,
      name: name
    };
  }

  if (oldLength < newLength) {
    node.value.params = argumentMappings.map(function (oldIndex) {
      if (typeof oldIndex === "string") {
        var newParam = createNewParameter();
        attachComments(newParam, [{
          "type": "Block",
          "value": oldIndex
        }]);
        return newParam;
      } else {
        return oldParams[oldIndex] || createNewParameter();
      }
    });
  } else if (oldLength > newLength) {
    node.value.params = argumentMappings.map(function (oldIndex) {
      return oldParams[oldIndex] || createNewParameter();
    });
  } else {
    node.value.params = argumentMappings.map(function (oldIndex) {
      return oldParams[oldIndex];
    });
  }

};

ChangeSignatureTransformation.prototype.performForMember = function (name, containingType, node, parent) {
  var oldArguments = parent.arguments;
  var argumentMappings = this.transformationTargets[containingType][name];
  if ((parent.type === Syntax.CallExpression || parent.type == Syntax.NewExpression)&& argumentMappings.length > 0 && argumentMappings[0].length && argumentMappings[0].indexOf(".") < 0){
    parent.arguments = [{
      "type": Syntax.ObjectExpression,
      "properties": oldArguments.map(function(arg, i) {
        return           {
          "type": Syntax.Property,
          "key": {
            "type": "Identifier",
            "name": argumentMappings[i] || "unkown",
          },
          "computed": false,
          "value": arg,
          "kind": "init",
          "method": false,
          "shorthand": false
        }
      })
    }];
    return;
  }

  if (parent.type === Syntax.CallExpression || parent.type == Syntax.NewExpression) {
    parent.arguments = argumentMappings.map(function (oldIndex) {
      if (typeof oldIndex === "number" && oldArguments[oldIndex]) {
        return oldArguments[oldIndex];
      } else {
        return {
          type: Syntax.Identifier,
          name: "undefined",
          "leadingComments": [{
            "type": "Block",
            "value": oldIndex
          }]
        }
      }
    });
  }
};

/**
 * @param {Object} config
 * @constructor
 * @extends AbstractMemberTransformation
 */
function ChangeReturnTypeTransformation(config) {
  AbstractMemberTransformation.call(this, config, "returnTypeChanges");
}
ChangeReturnTypeTransformation.prototype = Object.create(AbstractMemberTransformation.prototype);
ChangeReturnTypeTransformation.prototype.onDetectMember = function (name, containingType, isUnsafe, node, parent, stack) {
  if (stack[2].type !== Syntax.ExpressionStatement)
  return new ImpossibleCommentResolver(this, "The return type of '" + memberToString(containingType, name)
      + "' has changed to '" + this.transformationTargets[containingType][name] + "'");
};
ChangeReturnTypeTransformation.prototype.onDetectProperty = function(name, parentType, node, parent, stack) {
  return ChangeReturnTypeTransformation.prototype.onDetectMember.call(this, name, parentType, false, node, parent, stack);
};
ChangeReturnTypeTransformation.prototype.performForMember = function (name, containingType, node, parent) {};
ChangeReturnTypeTransformation.prototype.performForProperty = function (name, parentType, node, parent) {};

/**
 * @param {Object} config
 * @constructor
 * @extends AbstractMemberTransformation
 */
function AdjustCommentsTransformation(config) {
  AbstractTransformation.call(this, config["namespaceChanges"]);
}
AdjustCommentsTransformation.prototype = Object.create(AbstractTransformation.prototype);
/**
 * @param {Node} node
 * @param {Node} parent
 * @return {AbstractResolver|null}
 */
AdjustCommentsTransformation.prototype.detect = function detect(node, parent, stack) {
  var transformationTargets = this.transformationTargets;
  if (node.leadingComments && node.leadingComments.length){
    node.leadingComments.forEach(function(c){
      c.value = c.value.replace(/(\w+\.)+\w+/g, function(match){
        if (transformationTargets[match]) {
          return transformationTargets[match];
        } else {
          return match;
        }
      });
    });
    return null;
  }
};
/**
 * @param {Node} node
 * @param {Node|null} parent
 * @param {Node[]} stack
 */
AdjustCommentsTransformation.prototype.perform = function perform(node, parent, stack) {
  //throw "not implemented"
};

/**
 * @param {Node} node
 * @param {Node} parent
 * @param {Node[]} stack
 */
AdjustCommentsTransformation.prototype.enter = function (node, parent, stack) {
  var resolver = this.detect(node, parent, stack);
  if (resolver) {
    this.collect(node, resolver);
  }
};



/**
 * @param {Object} config
 * @constructor
 * @extends AbstractMemberTransformation
 */
function ChangePropertyTypeTransformation(config) {
  AbstractMemberTransformation.call(this, config, "propertyTypeChanges");
}
ChangePropertyTypeTransformation.prototype = Object.create(AbstractMemberTransformation.prototype);
ChangePropertyTypeTransformation.prototype.onDetectMember = function (name, containingType, isUnsafe, node, parent) {
  return new ImpossibleCommentResolver(this, "The type of '" + memberToString(containingType, name)
      + "' has changed to '" + this.transformationTargets[containingType][name] + "'");
};
ChangePropertyTypeTransformation.prototype.onDetectProperty = ChangePropertyTypeTransformation.prototype.onDetectMember;
ChangePropertyTypeTransformation.prototype.performForMember = function (name, containingType, node, parent) {};
ChangePropertyTypeTransformation.prototype.performForProperty = function (name, parentType, node, parent) {};

/**
 * @constructor
 * @extends AbstractTransformation
 */
function NamedConstructorsTransformation(config) {
  AbstractMemberTransformation.call(this, config,"signatureChanges");
}
NamedConstructorsTransformation.prototype = Object.create(AbstractTransformation.prototype);

NamedConstructorsTransformation.prototype.detect = function (node, parent) {
  if (node.type !== Syntax.MemberExpression || (parent.type !== Syntax.NewExpression)) {
    return null;
  }

  var type = node.scopeInfo.type;
  var returnType = extractReturnType(type.type);
  if (!returnType) {
    return null;
  }

  var objectType = node.object.scopeInfo.type;
  var objectReturnType = extractReturnType(objectType.type);
  // a static function is a named constructor if and only if the (return) types are the same
  if (returnType !== objectReturnType && returnType !== objectType.type) {
    return null;
  }

  return new AutomaticResolver(this);
};

NamedConstructorsTransformation.prototype.perform = function (node, parent, stack) {
  // for some unknown reason we cannot simply return node.object
  parent.callee = node.object;
};


/**
 * @param {Object} config
 * @constructor
 * @extends AbstractMemberTransformation
 */
function MethodPropertyTransformation(config) {
  AbstractMemberTransformation.call(this, config, "methodsProperties");
}
MethodPropertyTransformation.prototype = Object.create(AbstractMemberTransformation.prototype);

MethodPropertyTransformation.prototype.onDetectProperty = function (name, parentType, node, parent) {
  return new ImpossibleCommentResolver(this,
      "'" + memberToString(parentType, name) + "' is now a " + this.transformationTargets[parentType][name]);
};

MethodPropertyTransformation.prototype.onDetectMember = function (name, containingType, isUnsafe, node, parent, stack) {
  if (isUnsafe) {

    var newMemberKind = this.transformationTargets[containingType][name];
    if (newMemberKind == "property" && parent.type !== Syntax.CallExpression){
      // wrong we cannot treat a non-call expression as a call!
      return;
    }
    return new ConfidentCommentResolver(this,
        "'" + memberToString(containingType, name) + "' is now a " + this.transformationTargets[containingType][name], true);
  } else {
    return new AutomaticResolver(this);
  }
};

MethodPropertyTransformation.prototype.performForProperty = function(name, parentType, node, parent) {};

MethodPropertyTransformation.prototype.performForMember = function(name, containingType, node, parent) {
  var newMemberKind = this.transformationTargets[containingType][name];

  if (newMemberKind === "method") {
    if (parent.type === Syntax.AssignmentExpression && node === parent.left) {
      // a.property = 0 -> a.property(0)
      parent.type = Syntax.CallExpression;
      parent.callee = node;
      parent.arguments = [parent.right];
      delete parent.right;
      delete parent.left;
      delete parent.operator;
    } else {
      // foo(a.property) -> foo(a.property())
      node.type = Syntax.CallExpression;
      node.callee = {
        "type": Syntax.MemberExpression,
        "computed": node.computed,
        "object": node.object,
        "property": node.property
      };
      node.arguments = [];
      delete node.computed;
      delete node.object;
      delete node.property;
    }
  } else if (newMemberKind === "property" && parent.type === Syntax.CallExpression) {
    if (parent.arguments && parent.arguments.length === 1) {
      // a.property(0) -> a.property = 0
      parent.type = Syntax.AssignmentExpression;
      parent.right = parent.arguments[0];
      parent.left = node;
      parent.operator = "=";
    } else {
      // a.property() -> a.property
      parent.type = node.type;
      parent.computed = node.computed;
      parent.object = node.object;
      parent.property = node.property;
    }
    delete parent.callee;
    delete parent.arguments;
  }
};

/**
 * @param {Object} config
 * @constructor
 * @extends AbstractMemberTransformation
 */
function CompatMethodTransformation (config) {
  AbstractMemberTransformation.call(this, config, "compatMethods");
}
CompatMethodTransformation.prototype = Object.create(AbstractMemberTransformation.prototype);

CompatMethodTransformation.prototype.onDetectProperty = function (name, parentType, node, parent) {
  return new ImpossibleCommentResolver(this,
      "'" + memberToString(parentType, name) + "' has been removed.");
};

CompatMethodTransformation.prototype.onDetectMember = function (name, containingType, isUnsafe, node, parent) {
  return new ConfidentCommentResolver(this,
      "'" + memberToString(containingType, name) + "' has been removed. A compatibility method exists.", !isUnsafe);
};

CompatMethodTransformation.prototype.performForProperty = function (name, parentType, node, parent) {};

CompatMethodTransformation.prototype.performForMember = function (name, containingType, node, parent) {
  var compatMethodNameStack = this.transformationTargets[containingType][name].split(".");

  var compatMemberName = compatMethodNameStack.pop();
  if (node.property.type === Syntax.Literal) {
    node.property.value = compatMemberName;
  } else {
    node.property.name = compatMemberName;
  }

  var object = node.object;

  node.object = createMemberExpressionAst(compatMethodNameStack);

  parent.arguments.unshift(object);
};

/**
 * @param {Object} config
 * @constructor
 * @extends {AbstractMemberTransformation}
 */
function MemberRemovedTransformation(config) {
  var configEntryName = "removedMembers";
  AbstractMemberTransformation.call(this, config, configEntryName);

  var transformationTargets = this.transformationTargets = {};
  Object.getOwnPropertyNames(config[configEntryName] || {}).forEach(function (type) {
    transformationTargets[type] = {};
    config[configEntryName][type].forEach(function (memberName) {
      transformationTargets[type][memberName] = true;
    });
  });
}
MemberRemovedTransformation.prototype = Object.create(AbstractMemberTransformation.prototype);
MemberRemovedTransformation.prototype.onDetectProperty = function (name, containingType, node, parent) {
  return new ImpossibleCommentResolver(this, "'" + memberToString(containingType, name) + "' has been removed");
};
MemberRemovedTransformation.prototype.onDetectMember = MemberRemovedTransformation.prototype.onDetectProperty;
MemberRemovedTransformation.prototype.performForProperty = function (name, containingType, node, parent) {};
MemberRemovedTransformation.prototype.performForMember = function (name, parentType, node, parent) {};


//
// Resolvers
//

/**
 * @param {AbstractTransformation} transformation
 * @extends {AbstractResolver}
 * @constructor
 */
function AutomaticResolver(transformation) {
  AbstractResolver.call(this, transformation);
}
AutomaticResolver.prototype = Object.create(AbstractResolver.prototype);

/**
 * @param {AbstractTransformation} transformation
 * @param {String} comment
 * @param {boolean=} keepOldLine
 * @extends {AbstractResolver}
 * @constructor
 */
function ConfidentCommentResolver(transformation, comment, keepOldLine) {
  AbstractResolver.call(this, transformation);
  this.comments = [comment];
  this.keepOldLine = keepOldLine;
}
ConfidentCommentResolver.prototype = Object.create(AbstractResolver.prototype);

ConfidentCommentResolver.prototype.resolve = function (node, parent, stack) {
  commentsCount++;

  var rawComments = [].concat(
      "TODO: Migration:",
      this.comments
  );

  if (this.keepOldLine) {
    rawComments.push("If this is not what you wanted you can take the old line instead:");
    rawComments.push(getLineForNode(findStatement(stack)));
  }

  var comments = createCommentsAst(rawComments);

  node = AbstractResolver.prototype.resolve.call(this, node, parent, stack);

  attachComments(node, comments, true, stack);
};

ConfidentCommentResolver.prototype.merge = function (transformation, resolver) {
  if (resolver instanceof ImpossibleCommentResolver) {
    resolver.merge(transformation, this);
    return resolver;
  } else {
    AbstractResolver.prototype.merge.call(this, transformation, resolver);
    this.comments = this.comments.concat(resolver.comments);
    this.keepOldLine = this.keepOldLine || resolver.keepOldLine;
    return this;
  }
};

/**
 * @param {AbstractTransformation} transformation
 * @param {String} comment
 * @constructor
 * @extends {AbstractResolver}
 */
function ImpossibleCommentResolver(transformation, comment) {
  AbstractResolver.call(this, transformation);
  this.comments = [comment];
}
ImpossibleCommentResolver.prototype = Object.create(AbstractResolver.prototype);

ImpossibleCommentResolver.prototype.resolve = function (node, parent, stack) {
  node = AbstractResolver.prototype.resolve.call(this, node, parent, stack);
  commentsCount++;

  var comments = createCommentsAst([].concat(
    "TODO: Migration",
    this.comments
  ));

  attachComments(node, comments, true, stack);
};

ImpossibleCommentResolver.prototype.merge = function (transformation, resolver) {
  AbstractResolver.prototype.merge.call(this, transformation, resolver);
  this.comments = this.comments.concat(resolver.comments || []);
  return this;
};

//
// Util
//

/**
 * @param {*} type
 * @param {*} transformationTargets
 * @param {String} oldMemberName
 * @return {*}
 */
function getType(type, transformationTargets, oldMemberName, stack) {
  if (!type
      || type.guess
      || type.type === "?"
      || (type.type && type.type.indexOf("{") === 0 /* is a type like this: {foo, bar}*/)
      || type.type === type.exprName/* indicates that tern was not able to infer the type correctly */) {

    // if we have no type information, search if any type owns a member with this name
    var renames = Object.getOwnPropertyNames(transformationTargets).filter(function (type) {
      if (transformationTargets[type][oldMemberName]) {
        return true;
      }
    }).map(function (type) {
      return [type, transformationTargets[type][oldMemberName]];
    });

    if (renames.length && renames.every(function(tuple){ return tuple[1] == renames[0][1]})){
      // all have the same rename mapping - accept this is a guess
      type.type = renames[0][0];
    }

    if (type.type) {
      // if we have stack information and we are currently on a "this" member, we don't infer
      if (stack && stack[0] && stack[0].type == Syntax.MemberExpression && stack[0].object.type == Syntax.ThisExpression){
        type.type = "?";
      } else {
        type.guess = true
      }
    } else {
      type.type = "?";
    }
  } else if (type.type) {
    if (type.type.indexOf("$") >= 0) {
      type.type = type.type.split("$")[0];
    }
    if (type.type.endsWith(".prototype")) {
      type.type = type.type.substr(0, type.type.length - (".prototype".length));
    }
    if (type.type.indexOf("fn(") === 0){
      type.type = extractReturnType(type.type);
    }
  }
  return type;
}

/**
 * @param {Node} node
 * @return {String}
 */
function getOldMemberName(node) {
  return node.computed && node.property.type === Syntax.Literal ? node.property.value : node.property.name;
}

/**
 * @param {Node} node
 * @return {String}
 */
function getNameOfLiteralOrIdentifier(node) {
  return node.type === Syntax.Literal ? node.value : node.name;
}

/**
 * @param {Node} node
 * @return {String}
 */
function getLineForNode(node) {
  var lines = node.scopeInfo.lines;
  return lines
      .map(l => l.trim())
      .join("");
}

/**
 * @param {String[]} comments
 * @return {Node[]}
 */
function createCommentsAst(comments) {
  return comments.map(function (comment) {
    return {
      "type": "Line",
      "value": " " + comment
    }
  });
}

/**
 * @param {Node} node
 * @param {Node[]} comments
 * @param {boolean=false}atStatement
 * @param {Node[]=} stack
 */
function attachComments(node, comments, atStatement = false, stack = undefined) {
  if (atStatement) {
    node = findStatement(stack);
  }
  if (node.leadingComments) {
    node.leadingComments = node.leadingComments.concat(comments);
  } else {
    node.leadingComments = comments;
  }
}

/**
 * @param {Node} node
 * @return {boolean}
 */
function isStatement(node) {
  const type = node.type;
  return type.endsWith("Statement") || type.endsWith("Declaration");
}

/**
 * @param {Node[]} stack
 * @return {Node}
 */
function findStatement(stack) {
  for (const node of stack) {
    if (isStatement(node)) {
      return node;
    }
  }
}

/**
 * @param {String} type
 * @param {String} memberName
 * @return {string}
 */
function memberToString(type, memberName) {
  return type + "." + memberName;
}

/**
 * @param {String} type
 * @return {String|undefined}
 */
function extractReturnType(type) {
  var match = /^fn\([^)]*\) -> (.*)$/.exec(type);
  if (match) {
    return match[1];
  }
}

/**
 * @param {Node} node
 * @return {String}
 */
function flattenMemberExpression(node) {
  if (node.type === Syntax.Identifier) {
    return node.name;
  } else if (node.type === Syntax.ThisExpression) {
    return "this";
  } else if (node.type === Syntax.MemberExpression) {
    return flattenMemberExpression(node.object) + "." + getNameOfLiteralOrIdentifier(node.property);
  } else {
    return "";
  }
}

/**
 * @param {String[]} nameStack
 * @return {Node}
 */
function createMemberExpressionAst(nameStack) {
  if (nameStack.length === 1) {
    return {
      "type": Syntax.Identifier,
      "name": nameStack[0]
    }
  } else {
    var property = nameStack.pop();
    return {
      "type": Syntax.MemberExpression,
      "computed": false,
      "object": createMemberExpressionAst(nameStack),
      "property": {
        "type": Syntax.Identifier,
        "name": property
      }
    }
  }

}

module.exports = function (files, finishedCallback, convertClassDeclarations) {
  var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./changes.json")));

  var transformations = [
    new AdjustCommentsTransformation(config),
    new ChangeSignatureTransformation(config),
    new ChangeReturnTypeTransformation(config),
    new ChangePropertyTypeTransformation(config),
    new NamedConstructorsTransformation(config),
    new MethodPropertyTransformation(config),
    new CompatMethodTransformation(config),
    new MemberRemovedTransformation(config),
    new TypeRemovedTransformation(config),
    new ChangeNamespaceTransformation(config),
    new MemberRenameTransformation(config)
  ];


  Transformer.registerTransformations(transformations);

  async.map(files, function (file, callback) {
    fs.readFile(file.src, encodingOptions, function (err, code) {
      if (err) {
        return callback(err);
      }
      file.code = code;
      Transformer.addFile(file.src, code);
      callback(null, file);
    });
  }, function (err, files) {
    async.each(files, function (file, callback) {
      var code = Transformer.transformFile(file.src, file.code, convertClassDeclarations);

      async.series([
        mkdirp.bind(null, path.dirname(file.dest)),
        fs.writeFile.bind(fs, file.dest, code, encodingOptions)
      ], callback);

    }, function (err) {
      if (err) {
        if (finishedCallback) {
          return finishedCallback(err);
        }
        throw err;
      }

      if (commentsCount > 0) {
        console.log("The migration tool could handle " + commentsCount +
            " cases not automatically. Please search your code for 'TODO: Migration'.");
      } else {
        console.log("Your code has successfully been migrated.");
      }

      finishedCallback && finishedCallback(null);
    })
  });
};