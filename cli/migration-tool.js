var path = require("path");
var minimist = require("minimist");
var glob = require("glob");

var knownOptions = {
  alias: {
    "o": "out"
  }
};

var /*Object*/ opts = minimist(process.argv.slice(2), knownOptions);

var out = opts.out;
var cwd = opts.cwd;

var files = opts._.map(function (file) {
  var expanded = glob.sync(file, {cwd: cwd});

  return expanded.map(function (file) {
    return {
      src: path.join(cwd, file),
      dest: path.join(out, file)
    }
  });
});

files = Array.prototype.concat.apply([], files);

require("../lib/migration-tool")(files);