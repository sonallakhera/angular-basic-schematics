# Getting Started With Angular Basic Schematics

Angular Basic Schematics is a basic schematic implementation that helps create basic angular components required in an application. Like tables, details pages, toolbars.

### Setup Angular Basic Schematics

To start up with the ABS, `@angular/cli` and `@angular-devkit/schematics-cli` needs to be installed gobally in your system. Run below commands to get them installed.
```
npm i -g @angular/cli
```
```
npm i -g @angular-devkit/schematics-cli
```

Then, clone the repository with below command in an independent location.
```
git clone https://github.com/sonallakhera/angular-basic-schematics.git
```

Install npm dependencies with below command.
```
npm i
```

That's it! You are good to go!


### Use Angular Basic Schematics ( RISE Custom )

To generate a basic angular module:
```
NAME=<moduleName> npm run build:base-module
```

To generate a add dialog with form:
```
NAME=<moduleName> npm run build:add-dialog
```

To generate a details page:
```
NAME=<moduleName> npm run build:details-component
```

To generate a basic list page with table & filters:
```
NAME=<moduleName> npm run build:list-component
```


### Locate Your Build

Find your build under `./dist/` folder.



 
