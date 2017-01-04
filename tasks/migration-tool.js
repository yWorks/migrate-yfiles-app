var path = require("path");
module.exports = function (grunt) {
  grunt.registerMultiTask("migration-tool", "Automatically migrate yFiles for HTML 1.3 code to yFiles for HTML 2.0", function () {
    var files = Array.prototype.concat.apply([], this.files.map(function (file) {
      if (Array.isArray(file.src)) {
        return file.src.map(function (f) {
          return {
            src: f,
            dest: file.dest
          }
        });
      } else {
        return file;
      }
    }));

    var options = this.options({
      convertClassDeclarations: false,
    });

    require("../lib/migration-tool")(files, this.async(), options.convertClassDeclarations);
  });
};