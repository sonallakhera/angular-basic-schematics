import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { __DIST } from './../constants';

const collectionPath = path.join(__dirname, '../collection.json');


describe('add-form', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic('add-form', { name: 'testName' }, Tree.empty());

    expect(tree.files).toEqual([
      __DIST + '/test-name/test-name.module.ts',
      __DIST + '/test-name/routes.ts',
      __DIST + '/test-name/router/resolver/test-name.resolver.ts',
      __DIST + '/test-name/store/test-name.service.ts',
      __DIST + '/shared/test-name/test-name.module.ts',
    ]);
  });
});
