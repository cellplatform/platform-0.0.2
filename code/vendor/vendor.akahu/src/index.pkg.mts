/**
 * 💦 THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY 💦
 *
 *    This file is generated on each build.
 *    It reflects basic meta-data about the module and it's dependencies
 *    Use it via a standard `import` statement
 *
 *    - DO NOT manually edit.
 *    - DO commit to source-control.
 */

export const Pkg: ModuleDef = {
  name: 'vendor.akahu',
  version: '0.0.0',
  dependencies: {
    'akahu': '1.11.1',
    'sys.types': '0.0.0',
    'sys.util': '0.0.0',
    'sys.ui.react.common': '0.0.0',
  },
  toString() {
    return `${Pkg.name}@${Pkg.version}`;
  },
};

export type ModuleDef = {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
  toString(): string;
};
