import { FindUtil } from './util.Find.mjs';
import { JsonUtil, PackageJsonUtil } from './util.Json.mjs';
import { VersionUtil } from './util.Version.mjs';
import { fs } from './fs.mjs';
import { prettybytes } from './libs.mjs';

import type * as t from '../types.mjs';

/**
 * Common helpers.
 */
export const Util = {
  Json: JsonUtil,
  PackageJson: PackageJsonUtil,
  Version: VersionUtil,
  Find: FindUtil,

  asArray,

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

  /**
   * Calculate the size of a folder
   */
  async folderSize(dir: string) {
    const paths = await fs.glob(fs.join(dir, '**/*'));
    let bytes = 0;
    await Promise.all(
      paths.map(async (path) => {
        const stats = await fs.stat(path);
        bytes += stats.size;
      }),
    );
    return { dir, paths, bytes, toString: () => prettybytes(bytes) };
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
