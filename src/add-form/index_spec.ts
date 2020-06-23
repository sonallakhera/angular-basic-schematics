import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { __DIST } from './../constants';

const collectionPath = path.join(__dirname, '../collection.json');


describe('add-form', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic('add-form', { name: 'testNames', name_singular: 'testName' }, Tree.empty());

    expect(tree.files).toEqual([]);
  });
});
