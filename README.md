# Getting Started With Schematics with Angular Basic Schematics

Angular Basic Schematics is a basic Schematic implementation that helps create basic angular components required in an application. Like tables, details pages, toolbars.

### Testing

To test locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with
```bash
schematics --help
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.


### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

That's it!
 
