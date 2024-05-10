import type * as t from '../t';

import { fs } from './fs';
import { FindUtil } from './u.Find';
import { folderSize } from './u.FolderSize';
import { JsonUtil, PackageJsonUtil } from './u.Json';
import { VersionUtil } from './u.Version';

/**
 * Common helpers.
 */
export const Util = {
  Json: JsonUtil,
  PackageJson: PackageJsonUtil,
  Version: VersionUtil,
  Find: FindUtil,

  asArray,
  folderSize,

  stripRelativeRoot(input: t.PathString) {
    return trim(input).replace(/^\.\//, '');
  },

  ensureRelativeRoot(input: t.PathString) {
    return `./${Util.stripRelativeRoot(input)}`;
  },

  objectHasKeys(input: any) {
    if (typeof input !== 'object') return false;
    return Object.keys(input).length > 0;
  },

  async asyncFilter<T>(list: T[], predicate: (value: T) => Promise<boolean>) {
    const results = await Promise.all(list.map(predicate));
    return list.filter((_, index) => results[index]);
  },

  async importPkgMeta(dir: string) {
    type T = {
      name: string;
      version: string;
      dependencies: { [name: string]: string };
      toString(): string;
    };
    const path = fs.join(dir, 'src/index.pkg.mts');
    const exists = await fs.pathExists(path);
    return exists ? ((await import(path)).Pkg as T) : undefined;
  },
};

/**
 * Helpers
 */
function trim(value?: string) {
  return (value || '').trim();
}

export function asArray<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input];
}
