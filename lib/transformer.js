/**
 * @typedef {Object} Node
 * @property {Object} scopeInfo
 * @property {String[]} scopeInfo.lines
 * @property {String} scopeInfo.text
 */

var esprima = require("esprima");
var Syntax = esprima.Syntax;
var escodegen = require("escodegen");
var estraverse = require("estraverse");
var transformClassDeclarations = require("./es6class");

var es6 = require("es6-shim");

var tern = require("tern");

var parserOptions = {
  range: true,
  loc: true,
  comment: true,
  attachComments: true,
  tokens: true
};

var generatorOptions = {
  format: {
    indent: {
      style: "  ",
      base: 0,
      adjustMultilineComment: true
    }
  },
  comment: true,
  parse: esprima.parse // we need this to prevail the correct "raw" literals (e.g. correct quotes)
};


var ternServer = new tern.Server({
  async: false,
  defs: [require("./yfilesDefs.js")]
});


var _transformations;
var collectedIssuesMap = new es6.Map();
var files = {};
var fileLines = [];

/**
 * Calls {@link AbstractTransformation.prototype.detect} for each node in the AST. If a {@link AbstractResolver}
 * was returned by the implementation, its {@link AbstractResolver.prototype.resolve} method will be invoked later,
 * which might call {@link AbstractTransformation.prototype.perform} to perform the actual AST transformation.
 * @param {*} transformationTargets
 * @property {*} transformationTargets
 * @constructor
 */
function AbstractTransformation(transformationTargets) {
  this.transformationTargets = transformationTargets;
}

/**
 * @param {Node} node
 * @param {Node} parent
 * @return {AbstractResolver|null}
 */
AbstractTransformation.prototype.detect = function detect(node, parent, stack) {
  throw "not implemented"
};
/**
 * @param {Node} node
 * @param {Node|null} parent
 */
AbstractTransformation.prototype.perform = function perform(node, parent) {
  throw "not implemented"
};

/**
 * @param {Node} node
 * @param {Node} parent
 */
AbstractTransformation.prototype.enter = function (node, parent, stack) {
  var resolver = this.detect(node, parent, stack);
  if (resolver) {
    this.collect(node, resolver);
  }
};

/**
 * @param {Node} node
 * @param resolver
 */
AbstractTransformation.prototype.collect = function (node, resolver) {
  if (collectedIssuesMap.has(node)) {
    collectedIssuesMap.set(node, collectedIssuesMap.get(node).merge(this, resolver));
  } else {
    collectedIssuesMap.set(node, resolver);
  }
};

/**
 * @param {AbstractTransformation} transformation
 * @constructor
 */
function AbstractResolver(transformation) {
  this.transformations = [transformation];
}
/**
 * @param {Node} node
 * @param {Node} parent
 * @return {Node|undefined}
 */
AbstractResolver.prototype.resolve = function (node, parent, stack) {
  return this.transformations.reduce(function (node, transformation) {
    return transformation.perform(node, parent, stack) || node;
  }, node);
};

/**
 * @param {AbstractTransformation} transformation
 * @param {AbstractResolver} resolver
 */
AbstractResolver.prototype.merge = function (transformation, resolver) {
  this.transformations.push(transformation);
  return this;
};


/**
 * @param {AbstractTransformation[]} transformations
 */
function registerTransformations(transformations) {
  _transformations = transformations;
}

var emptyLineEspcape = "//@@yfiles-migration-tool@@";
/**
 * @param {String} name
 * @param {String} code
 */
function addFile(name, code) {
  // in order to keep newlines, replace all empty lines by a special comment
  code = code.replace(/(\r?\n)\s*(\r?\n)/gm, "$1" + emptyLineEspcape + "$2");

  ternServer.addFile(name, code);

  files[name] = code;
  fileLines[name] = code.split(/\r?\n/g);
}

/**
 * @param {String} fileName
 * @param {Number} start
 * @param {Number} end
 * @return {*}
 */
function requestType(fileName, start, end) {
  var type;
  ternServer.request({
    query: {
      type: "type",
      file: fileName,
      start: start,
      end: end
    }
  }, function (err, result) {
    if (!err) {
      type = result;
    }
  });

  // TODO: this only works in sync mode
  return type;
}

/**
 * @param fileName
 * @param {String} code The file content as string
 * @return {String} The transformed file content
 */
function transformFile(fileName, code, transformClasses) {
  // in order to keep newlines, replace all empty lines by a special comment
  code = code.replace(/(\r?\n)\s*(\r?\n)/gm, "$1" + emptyLineEspcape + "$2");

  var ast = esprima.parse(code, parserOptions);

  estraverse.attachComments(ast, ast.comments, ast.tokens);

  estraverse.traverse(ast, {
    enter: function (node, parent) {
      node.scopeInfo = {
        type: requestType(fileName, node.range[0], node.range[1]),
        lines: fileLines[fileName].slice(node.loc.start.line - 1, node.loc.end.line),
        text: files[fileName].substring(node.range[0], node.range[1])
      };
    }
  });

  var stack = [];
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      stack.unshift(node);
      _transformations.forEach(function (transformation) {
        transformation.enter(node, parent, stack);
      });
    },
    leave: function (node, parent) {
      if (collectedIssuesMap.has(node)) {
        var resolver = collectedIssuesMap.get(node);
        node = resolver.resolve(node, parent, stack) || node;
      }
      stack.shift();
      return node;
    }
  });

  transformClasses && transformClassDeclarations(ast);

  var generatedCode = escodegen.generate(ast, generatorOptions);
  // remove the empty line markers again
  generatedCode = generatedCode.replace(new RegExp("[\\t\\f ]*" + emptyLineEspcape, "gm"), "");

  // remove all newlines after /*...*/ inline comments
  generatedCode = generatedCode.replace(/([^\s]+[\t\f ]*\/\*.*?\*\/)\r?\n\s*/gm, "$1");

  return generatedCode;
}

exports.registerTransformations = registerTransformations;
exports.addFile = addFile;
exports.transformFile = transformFile;
exports.AbstractTransformation = AbstractTransformation;
exports.AbstractResolver = AbstractResolver;