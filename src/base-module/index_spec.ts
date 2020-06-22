import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';


const collectionPath = path.join(__dirname, '../collection.json');


describe('base-module', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic('base-module', { name: 'testName', path: '/testPath' }, Tree.empty());

    expect(tree.files).toEqual([
      '/testPath/testName/helper.ts'
    ]);
  });
});
