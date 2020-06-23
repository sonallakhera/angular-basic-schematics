import { 
  Rule,
  SchematicContext,
  Tree,
  url,
  apply,
  move,
  MergeStrategy,
  mergeWith,
  template
} from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';

import { __DIST } from './../constants';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function listComponent(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const folderPath = normalize(strings.dasherize(`${__DIST}`));
    let files = url('./files');
    
    let newTree = apply(files, [
      move(folderPath),
      template({
        ...strings,
        ..._options
      })
    ]);

    let newRule = mergeWith(newTree, MergeStrategy.Default);

    return newRule(tree, _context);
  };
}
