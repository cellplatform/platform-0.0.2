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
  name: 'ext.lib.wallet.rainbow',
  version: '0.0.0',
  dependencies: {
    '@rainbow-me/rainbowkit': '1.3.2',
    'sys.util': '0.0.0',
    'sys.ui.react.common': '0.0.0',
    'viem': '1.21.1',
    'wagmi': '1.4.12',
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
