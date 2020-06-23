import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { __DIST } from './../constants';

const collectionPath = path.join(__dirname, '../collection.json');


describe('base-module', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic('base-module', { name: 'testNames', name_singular: 'testName' }, Tree.empty());

    expect(tree.files).toEqual([
      __DIST + '/pm/test-names/test-names.module.ts',
      __DIST + '/pm/test-names/routes.ts',
      __DIST + '/pm/test-names/router/resolver/test-name.resolver.ts',
      __DIST + '/pm/test-names/store/test-names.service.ts',
      __DIST + '/shared/test-names/test-names.module.ts',
    ]);
  });
});
