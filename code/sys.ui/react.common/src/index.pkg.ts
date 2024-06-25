/**
 * 💦 THIS IS AN AUTOGENERATED FILE. DO NOT EDIT DIRECTLY 💦
 *
 *    This file is generated on each build.
 *    It reflects basic meta-data about the module and it's dependencies
 *    Use it via a standard `import` statement
 *
 *    - DO NOT manually edit.
 *    - DO commit to source-control.
 */

export const Pkg: ModuleDef = {
  name: 'sys.ui.react.common',
  version: '0.0.0',
  dependencies: {
    '@preact/signals-react': '2.0.2',
    'ext.lib.immer': '0.0.0',
    'minimist': '1.2.8',
    'qrcode': '1.5.3',
    'react': '18.3.1',
    'react-dom': '18.3.1',
    'react-icons': '5.2.1',
    'react-spinners': '0.13.8',
    'react-inspector': '6.0.2',
    'sys.data.text': '0.0.0',
    'sys.ui.dom': '0.0.0',
    'sys.ui.react.util': '0.0.0',
    'sys.ui.react.css': '0.0.0',
    'sys.util': '0.0.0',
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
