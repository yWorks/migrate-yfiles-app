/**
 * Migrate yFiles for HTML 1.3 JavaScript code to yFiles for HTML 2.0.
 */
module.exports = function(grunt) {

  // point to folder (or file) that should be migrated
  var contentSrc = "./path/to/source";

  // the output folder (don't omit trailing slash!)
  var contentDest = "./path/to/converted/source/";

  grunt.registerTask("default", ["migration-tool"]);

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    "migration-tool": {
      migrate: {
        files: [{
          // Only convert JavaScript files in the specified source directory.
          // The resulting files will be placed relative to top-level destination directory.
          // You can exclude folders and files from the migration process by "!" prefix, e.g.
          // a 'lib' or 'node_modules' folder.
          expand: true,
          cwd: contentSrc,
          src: ["**/*.js", "!**/lib/**", "!**/node_modules/**"],
          dest: contentDest
        }],
        // in order to only convert a single file, do this:
        /*
        files: [{
          expand: true,
          src: ["MySingleSourceFile.js"],
          dest: contentDest
        }],
        */
        // In order to automatically convert yFiles class declarations to ES-6 classes do this:
        options: {
          convertClassDeclarations: true,
        }
      }
    }
  });

  require("load-grunt-tasks")(grunt);
  grunt.task.loadTasks("./tasks");
};