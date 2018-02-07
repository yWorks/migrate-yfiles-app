# migrate-yfiles-app
Javascript toolchain that helps in migrating yFiles for HTML 2.0 apps to the yFiles for HTML 2.1 API

# Usage
1. Run `npm install` to install the dependencies.
2. Specify the input (`contentSrc`) and output (`contentDest`) folder in the gruntfile.
3. Run `grunt` to migrate your files from yFiles for HTML 2.0 to yFiles for HTML 2.1.

# Notes
Please review the migrated files after the process. The migration tool will automatically convert API calls from 1.3 to 2.0. Afterwards you will find many yFiles API calls to be migrated automatically. Usually, you will also find `TODO: Migration: ...` annotations in the output files. These occurences need a manual review because the tool was not able to convert it automatically. This may be due to missing type information or due to incompatible API changes.