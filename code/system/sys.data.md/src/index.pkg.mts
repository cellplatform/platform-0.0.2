/**
 * [GENERATED FILE]
 *    This file is generated on each build.
 *    Use it (via an import) to determine basic facts about the bundled module.
 *
 *    - Do not manually edit.
 *    - Do commit it to source-control.
 */

export const Pkg: ModuleDef = {
  name: 'sys.data.md',
  version: '0.0.0',
  dependencies: {
    'sys.types': '0.0.0',
    'sys.util': '0.0.0',
    'sanitize-html': '2.7.1',
    'rehype-format': '3.1.0',
    'rehype-stringify': '8.0.0',
    'remark-parse': '9.0.0',
    'remark-rehype': '8.1.0',
    'unified': '9.2.1',
  },
  toString() {
    return `💦 module: ${Pkg.name} (v${Pkg.version})`;
  },
};

export type ModuleDef = {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
  toString(): string;
};
