import { 
  Rule,
  SchematicContext,
  Tree,
  url,
  apply,
  move,
  MergeStrategy,
  mergeWith
} from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function baseModule(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const folderPath = normalize(_options.path + '/' + _options.name);
    const files = url('./files');
    
    let newTree = apply(files, [ move(folderPath) ]);

    let newRule = mergeWith(newTree, MergeStrategy.Default);

    return newRule(tree, _context);
  };
}
