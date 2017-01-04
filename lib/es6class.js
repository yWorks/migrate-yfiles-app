var Syntax = require("esprima").Syntax;
var estraverse = require("estraverse");

module.exports = function transformClassDeclarations(ast) {

  var stack = [];
  var typeStack = [];

  function findProperty(definition, name, keepProp) {
    let index = definition.properties.findIndex(function (p) {
      return p.type === Syntax.Property && p.kind === "init" && !p.computed && (
              (p.key.type === Syntax.Literal && p.key.value === name) ||
              (p.key.type === Syntax.Identifier && p.key.name === name)
          );
    });
    let result = definition.properties[index];
    if (index >= 0 && !keepProp) {
      definition.properties.splice(index, 1);
    }
    return result;
  }

  function isClassDefinition(node, parent) {
    return node.type === Syntax.NewExpression && node.callee.type === Syntax.MemberExpression && node.callee.object.type === Syntax.Identifier && node.callee.object.name === "yfiles"
        && node.callee.property.type === Syntax.Identifier && node.callee.property.name === "ClassDefinition"
        && parent && parent.type === Syntax.AssignmentExpression
        && parent.right === node
        && parent.operator === "=" && parent.left.type === Syntax.MemberExpression
        && parent.left.property.type === Syntax.Identifier;
  }

  function isClassMemberDefinition(node, parent) {
    return node.type === Syntax.NewExpression && node.callee.type === Syntax.MemberExpression && node.callee.object.type === Syntax.Identifier && node.callee.object.name === "yfiles"
        && node.callee.property.type === Syntax.Identifier && node.callee.property.name === "ClassDefinition"
        && parent && parent.type === Syntax.Property
        && parent.value === node
  }

  function processDefinitions(definition, cld, statics) {
    definition.properties.forEach(function (prop) {
      if (prop.type === Syntax.Property) {
        switch (prop.kind) {
          case "init":
            var propertyName = prop.key.type === Syntax.Identifier ? prop.key.name : prop.key.type === Syntax.Literal ? prop.key.value : null;
            if (propertyName) {
              switch (propertyName) {
                case "$static":
                  break;
                case "$extends":
                case "$with":
                case "$abstract":
                case "constructor":
                  return;
                case "$clinit":

                  // find the next block above this declaration to insert prototype members
                  for (var index = stack.length - 1; index > 0 && stack[index].type !== Syntax.BlockStatement; index--);
                  if (index >= 0) {
                    stack[index].body.push({
                      "leadingComments": prop.leadingComments,
                      "type": Syntax.ExpressionStatement,
                      "expression": {
                        "type": "CallExpression",
                        "callee": prop.value,
                        "arguments": []
                      }
                    });
                  }

                  return;
                case "$meta":
                  break;
              }
              switch (prop.value.type) {
                case Syntax.FunctionExpression:
                  prop.key = {type: Syntax.Identifier, name: propertyName};
                  cld.body.body.push({
                    "leadingComments": prop.leadingComments,
                    "type": Syntax.MethodDefinition,
                    "key": prop.key,
                    "value": prop.value,
                    "kind": "method",
                    "static": !!statics
                  });
                  break;
                case Syntax.ObjectExpression:
                  prop.key = {type: Syntax.Identifier, name: propertyName};
                  let getter = findProperty(prop.value, "get");
                  let setter = findProperty(prop.value, "get");
                  let meta = findProperty(prop.value, "$meta");
                  let value = findProperty(prop.value, "value");
                  if (getter) {
                    cld.body.body.push({
                      "leadingComments": prop.leadingComments,
                      "type": Syntax.MethodDefinition,
                      "key": prop.key,
                      "value": getter.value,
                      "kind": "get",
                      "static": !!statics
                    });
                  }
                  if (setter) {
                    cld.body.body.push({
                      "leadingComments": prop.leadingComments,
                      "type": Syntax.MethodDefinition,
                      "key": prop.key,
                      "value": setter.value,
                      "kind": "set",
                      "static": !!statics
                    });
                  }
                  if (value) {
                    cld.body.body.push({
                      "leadingComments": prop.leadingComments,
                      "type": Syntax.MethodDefinition,
                      "key": prop.key,
                      "value": value.value,
                      "kind": "method",
                      "static": !!statics
                    });
                  }
                  break;
                default:
                  // literals, etc. go straight into the prototype
                  var assignment;
                  if (!statics) {
                    assignment = {
                      "type": Syntax.AssignmentExpression,
                      "operator": "=",
                      "left": {
                        "type": Syntax.MemberExpression,
                        "object": {
                          "type": Syntax.MemberExpression,
                          "object": cld.id,
                          "property": {
                            "type": Syntax.Identifier,
                            "name": "prototype"
                          }
                        },
                        "property": {type: Syntax.Identifier, name: propertyName}
                      },
                      "right": prop.value
                    };
                  } else {
                    assignment = {
                      "type": Syntax.AssignmentExpression,
                      "operator": "=",
                      "left": {
                        "type": Syntax.MemberExpression,
                        "object": cld.id,
                        "property": {type: Syntax.Identifier, name: propertyName}
                      },
                      "right": prop.value
                    };
                  }

                  // find the next block above this declaration to insert prototype members
                  for (var index = stack.length - 1; index > 0 && stack[index].type !== Syntax.BlockStatement; index--);
                  if (index >= 0) {
                    stack[index].body.push({
                      "leadingComments": prop.leadingComments,
                      "type": Syntax.ExpressionStatement,
                      "expression": assignment
                    });
                  }

                  if (isClassMemberDefinition(prop.value, prop)) {
                    assignment.right = convertClassDeclaration(prop.value, prop, typeStack) || {
                          type: Syntax.Literal,
                          value: "unresolved"
                        };
                  }

                  break;
              }
            }
            break;
          case "get":
          case "set":
            if (prop.value.type === Syntax.FunctionExpression) {
              if (prop.key.type === Syntax.Literal) {
                prop.key = {type: Syntax.Identifier, name: prop.key.value};
              }
              cld.body.body.push({
                "type": Syntax.MethodDefinition,
                "key": prop.key,
                "value": prop.value,
                "kind": prop.kind,
                "static": !!statics
              });
              break;
            }
            break;
        }
      }
    })
  }

  function convertClassDeclaration(node, parent) {
    var definition = node.arguments.length === 1 && node.arguments[0].type === Syntax.FunctionExpression &&
        node.arguments[0].body.type === Syntax.BlockStatement && node.arguments[0].body.body.length > 0 &&
        node.arguments[0].body.body[0].type === Syntax.ReturnStatement &&
        node.arguments[0].body.body[0].argument.type === Syntax.ObjectExpression && node.arguments[0].body.body[0].argument;

    var name = parent.type === Syntax.AssignmentExpression ? parent.left.property.name : null;
    if (!name && parent.type === Syntax.Property) {
      if (parent.key.type === Syntax.Literal) {
        name = parent.key.value;
      } else if (parent.key.type === Syntax.Identifier) {
        name = parent.key.name;
      } else {
        name = "NoName";
      }
    }

    var cld = {
      "type": Syntax.ClassDeclaration,
      "id": {
        "type": Syntax.Identifier,
        "name": name
      },
      "body": {
        "type": Syntax.ClassBody,
        "body": []
      }
    };


    var extendsProperty = findProperty(definition, "$extends");
    if (extendsProperty) {
      cld.superClass = extendsProperty.value;
    }
    var withProperty = findProperty(definition, "$with");
    if (withProperty) {

      var classCall = {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "object": {
            "type": "MemberExpression",
            "object": {
              "type": "Identifier",
              "name": "yfiles"
            },
            "property": {
              "type": "Identifier",
              "name": "lang"
            }
          },
          "property": {
            "type": "Identifier",
            "name": "Class"
          }
        },
        "arguments": []
      };

      var baseTypeName = null;
      cld.superClass = classCall;
      if (extendsProperty) {
        if (extendsProperty.value.type === Syntax.Literal) {
          baseTypeName = extendsProperty.value.value;
        } else if (extendsProperty.value.type === Syntax.MemberExpression && extendsProperty.value.property.type === Syntax.Identifier) {
          baseTypeName = extendsProperty.value.property.name;
        }
        classCall.arguments.push(extendsProperty.value);
      }

      cld.superTypeName = baseTypeName;

      if (withProperty.value.type === Syntax.ArrayExpression) {
        withProperty.value.elements.forEach(function (i) {
          classCall.arguments.push(i);
        })
      } else {
        classCall.arguments.push(withProperty.value);
      }
    }

    var constr = findProperty(definition, "constructor", true);
    if (constr) {

      var constrDecl = {
        "type": Syntax.MethodDefinition,
        "key": {
          "type": Syntax.Identifier,
          "name": "constructor"
        },
        "leadingComments": constr.leadingComments,
        "value": {
          "type": Syntax.FunctionExpression,
          "params": [],
          "body": {
            "type": Syntax.BlockStatement,
            "body": []
          },
        },
        "kind": "constructor",
      };

      if (constr.value.type === Syntax.ObjectExpression) {
        var defaultConstr = findProperty(constr.value, "default", true);
        if (defaultConstr) {
          constrDecl.value = defaultConstr.value;
        }
      } else if (constr.value.type === Syntax.FunctionExpression) {
        constrDecl.value = constr.value;
      }
      cld.body.body.push(constrDecl);
    }


    processDefinitions(definition, cld);
    var statics = findProperty(definition, "$static", true);
    statics && processDefinitions(statics.value, cld, true)
    return cld;
  }

  estraverse.replace(ast, {
    enter: function (node, parent) {
      stack.unshift(node);
      if (node.superTypeName) {
        typeStack.push(node.superTypeName);
      }
      // BaseType.call(this,)
      if (typeStack.length > 0 && node.type === Syntax.CallExpression && node.callee.type === Syntax.MemberExpression && node.callee.object.type === Syntax.MemberExpression && node.callee.object.property.type === Syntax.Identifier && node.callee.property.name === "call") {
        // could be "BaseType.call("
        if (node.callee.type === Syntax.MemberExpression && node.callee.property.type === Syntax.Identifier) {
          if (node.callee.object.type === Syntax.MemberExpression &&
              typeStack[typeStack.length - 1] === node.callee.object.property.name
              && node.arguments.length > 0 && node.arguments[0].type === Syntax.ThisExpression) {
            node.callee = {type: Syntax.Super};
            node.arguments.splice(0, 1);
          }
        }
      }

      // BaseType.apply(this,)
      if (node.type === Syntax.CallExpression && node.callee.type === Syntax.MemberExpression && node.callee.object.type === Syntax.MemberExpression && node.callee.object.property.type === Syntax.Identifier && node.callee.property.name === "apply") {
        // could be "BaseType.apply("
        if (node.callee.type === Syntax.MemberExpression && node.callee.property.type === Syntax.Identifier) {
          if (node.callee.object.type === Syntax.MemberExpression &&
              typeStack[typeStack.length - 1] === node.callee.object.property.name
              && node.arguments.length > 0 && node.arguments[0].type === Syntax.ThisExpression) {
            node.callee = {type: Syntax.Super};
            node.arguments.splice(0, 1);
            if (node.arguments.length > 0) {
              if (node.arguments[0].type === Syntax.ArrayExpression) {
                node.arguments = node.arguments[0].elements;
              } else {
                node.arguments = [{type: Syntax.SpreadElement, argument: node.arguments[0]}];
              }
            }
          }
        }
      }

      // ThisType.$super.call(this,)
      if (node.type === Syntax.CallExpression && node.callee.type === Syntax.MemberExpression && node.callee.object.type === Syntax.MemberExpression && node.callee.object.property.type === Syntax.Identifier && node.callee.property.name === "call") {
        // could be "$super.call("
        if (node.callee.type === Syntax.MemberExpression && node.callee.property.type === Syntax.Identifier) {
          if (node.callee.object.type === Syntax.MemberExpression && node.callee.object.object.type === Syntax.MemberExpression &&
              node.callee.object.object.property.type === Syntax.Identifier &&
              node.callee.object.object.property.name === "$super"
              && node.arguments.length > 0 && node.arguments[0].type === Syntax.ThisExpression) {
            node.callee.property = node.callee.object.property;
            node.callee.object = {type: Syntax.Super};
            node.arguments.splice(0, 1);
          }
        }
      }

      // ThisType.$super.method.call(this,)
      if (node.type === Syntax.CallExpression && node.callee.type === Syntax.MemberExpression && node.callee.object.type === Syntax.MemberExpression && node.callee.object.property.type === Syntax.Identifier && node.callee.property.name === "call") {
        // could be "$super.call("
        if (node.callee.type === Syntax.MemberExpression && node.callee.property.type === Syntax.Identifier) {
          if (node.callee.object.type === Syntax.MemberExpression && node.callee.object.object.type === Syntax.MemberExpression &&
              node.callee.object.object.property.type === Syntax.Identifier &&
              node.callee.object.property.name === "$super"
              && node.arguments.length > 0 && node.arguments[0].type === Syntax.ThisExpression) {
            node.callee = {type: Syntax.Super};
            node.arguments.splice(0, 1);
          }
        }
      }

      // ThisType.$super.getOwnProperty("name",this).get()
      if (node.type === Syntax.CallExpression && node.callee.type === Syntax.MemberExpression && node.callee.object.type === Syntax.MemberExpression && node.callee.object.property.type === Syntax.Identifier && node.callee.property.name === "getOwnProperty") {
        // could be "$super.call("
        if (node.callee.type === Syntax.MemberExpression && node.callee.property.type === Syntax.Identifier) {
          if (node.callee.object.type === Syntax.MemberExpression && node.callee.object.object.type === Syntax.MemberExpression &&
              node.callee.object.property.type === Syntax.Identifier &&
              node.callee.object.property.name === "$super"
              && node.arguments.length == 2 && node.arguments[1].type === Syntax.ThisExpression && node.arguments[0].type === Syntax.Literal) {
            if (parent.type === Syntax.MemberExpression && parent.object.type === Syntax.CallExpression && parent.property.type === Syntax.Identifier) {
              if (parent.property.name === "get") {
                var newNode = stack[2];
                newNode.type = Syntax.MemberExpression;
                newNode.object = {type: Syntax.Super};
                newNode.property = {type: Syntax.Identifier, name: node.arguments[0].value};
                delete newNode.callee;
                delete newNode.arguments;
                return;
              } else if (parent.property.name === "set") {
                var newnode = stack[2];
                newnode.type = Syntax.AssignmentExpression;
                newnode.operator = "=";
                newnode.left = {
                  type: Syntax.MemberExpression,
                  object: {type: Syntax.Super},
                  property: {type: Syntax.Identifier, name: node.arguments[0].value}
                }
                newnode.right = stack[2].arguments[0];
                delete node.callee;
                delete node.arguments;
                return;
              }
            }
          }
        }
      }
      if (node.type === Syntax.CallExpression && node.callee.type === Syntax.MemberExpression && node.callee.object.type === Syntax.MemberExpression && node.callee.object.property.type === Syntax.Identifier && node.callee.property.name === "get") {
        // could be "$super.call("
        if (node.callee.type === Syntax.MemberExpression && node.callee.property.type === Syntax.Identifier) {
          if (node.callee.object.type === Syntax.MemberExpression && node.callee.object.object.type === Syntax.MemberExpression &&
              node.callee.object.object.property.type === Syntax.Identifier &&
              node.callee.object.object.property.name === "$super"
              && node.arguments.length > 0 && node.arguments[0].type === Syntax.ThisExpression) {
            node.callee.property = node.callee.object.property;
            node.callee.object = {type: Syntax.Super};
            node.arguments.splice(0, 1);
          }
        }
      }
      // ThisType.$super.apply(this,)
      if (node.type === Syntax.CallExpression && node.callee.type === Syntax.MemberExpression && node.callee.object.type === Syntax.MemberExpression && node.callee.object.property.type === Syntax.Identifier && node.callee.property.name === "apply") {
        // could be "$super.apply("
        if (node.callee.type === Syntax.MemberExpression && node.callee.property.type === Syntax.Identifier) {
          if (node.callee.object.type === Syntax.MemberExpression && node.callee.object.object.type === Syntax.MemberExpression &&
              node.callee.object.object.property.type === Syntax.Identifier &&
              node.callee.object.object.property.name === "$super"
              && node.arguments.length > 0 && node.arguments[0].type === Syntax.ThisExpression) {
            node.callee.property = node.callee.object.property;
            node.callee.object = {type: Syntax.Super};
            node.arguments.splice(0, 1);
            if (node.arguments.length > 0) {
              if (node.arguments[0].type === Syntax.ArrayExpression) {
                node.arguments = node.arguments[0].elements;
              } else {
                node.arguments = [{type: Syntax.SpreadElement, argument: node.arguments[0]}];
              }
            }
          }
        }
      }
      if (isClassDefinition(node, parent) || isClassMemberDefinition(node, parent)) {
        var result = convertClassDeclaration(node, parent, typeStack);
        if (result.superTypeName) {
          typeStack.push(result.superTypeName);
        }
        return result;
      }
    },
    leave: function (node, parent) {
      if (node.superTypeName && typeStack[typeStack.length - 1] === node.superTypeName) {
        typeStack.pop();
      }
      stack.shift();
    }
  });
}

