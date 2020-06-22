import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { __DIST } from './../constants';

const collectionPath = path.join(__dirname, '../collection.json');


describe('base-module', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic('base-module', { name: 'testName', path: '/testPath' }, Tree.empty());

    expect(tree.files).toEqual([
      __DIST + '/test-path/test-name/test-name.module.ts',
      __DIST + '/test-path/test-name/routes.ts',
      __DIST + '/test-path/test-name/router/resolver/test-name.resolver.ts',
      __DIST + '/test-path/test-name/store/test-name.service.ts',
    ]);
  });
});
