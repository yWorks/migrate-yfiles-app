# yFiles Migration Tool
[![NPM version](https://img.shields.io/npm/v/@yworks/migrate-yfiles-app?style=flat)](https://www.npmjs.org/package/@yworks/migrate-yfiles-app)

The source of this tool is available at [GitHub](https://github.com/yWorks/migrate-yfiles-app).

Use this tool to help you migrate your existing yFiles application a new version.

The migration-tool will work best on strict typescript. For frontend frameworks,
it is best to keep the script-code separate from HTML-templates.
In order to type-check the code you want migrate the tool requires you to have the previous version of yFiles for HTML installed into your project. That is, when migrating from 2.6 to 3.0, 2.6 needs to be installed. 

In general the tool will either perform automatic migration or add a migration
comment that can include helpful information to ease more complex migration
operations.

> [!CAUTION]
> This tool will manipulate the files in place, make sure that you have no uncommitted changes and/or a backup

## Usage
Point the migration-tool to the tsconfig of your project
```
npx @yworks/migration-tool --configPath=<path_to_tsconfig>
```
or alternatively to a folder containing the files you want to migrate
```
npx @yworks/migration-tool --folderPath=<path_to_migratable_files>
```
## About yFiles

[yFiles](https://www.yworks.com/yfiles) is the industry-leading software library for visualizing, editing and analyzing graphs.


## Contact

[yWorks.com/contact](https://www.yworks.com/contact)

yWorks GmbH, Vor dem Kreuzberg 28, 72070 Tuebingen, Germany
