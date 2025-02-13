# yFiles Migration Tool
[![NPM version](https://img.shields.io/npm/v/@yworks/migrate-yfiles-app?style=flat)](https://www.npmjs.org/package/@yworks/migrate-yfiles-app)

The source of this tool is available at [GitHub](https://github.com/yWorks/migrate-yfiles-app).

Use this tool to help you migrate your existing yFiles application a new version.

The migration-tool will work best on strict typescript. For frontend frameworks,
it is best to keep the script-code separate from HTML-templates.
> [!CAUTION]
>In order for the migration tool to work, you to have the version of yFiles for HTML installed into your project that you want to migrate from. That is, when migrating from 2.6 to 3.0, 2.6 needs to be installed.


![Automatic migrations](https://raw.githubusercontent.com/yWorks/migrate-yfiles-app/master/assets/automaticMigration.png)

In general the tool will either perform automatic migration or add a migration
comment that can include helpful information to ease more complex migration
operations.
As shown the automatic migrations range in complexity from simple renames to more complex signature changes.

> [!CAUTION]
> This tool will manipulate the files in place, make sure that you have no uncommitted changes and/or a backup

> [!IMPORTANT]  
> This version is exclusively for the migration from 2.6 to 3.0, for earlier version have a look at earlier GitHub releases

## Usage
Point the migration-tool to the tsconfig of your project
```
npx @yworks/migrate-yfiles-app@latest --configPath=<path_to_tsconfig>
```
or alternatively to a folder containing the files you want to migrate
```
npx @yworks/migrate-yfiles-app@latest --folderPath=<path_to_migratable_files>
```
When migrating from EAP1 to EAP2 use the 
````
--from="EAP1"
````
flag.

## About yFiles

[yFiles](https://www.yworks.com/yfiles) is the industry-leading software library for visualizing, editing and analyzing graphs.


## Contact

[yWorks.com/contact](https://www.yworks.com/contact)

yWorks GmbH, Vor dem Kreuzberg 28, 72070 Tuebingen, Germany
