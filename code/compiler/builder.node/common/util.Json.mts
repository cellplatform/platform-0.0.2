import { fs } from './fs.mjs';
import { R } from './libs.mjs';

import type * as t from '../types.mjs';

/**
 * General JSON helpers.
 */
export const JsonUtil = {
  async load<T>(file: t.PathString) {
    return (await fs.readJson(fs.resolve(file))) as T;
  },

  stringify(input: any) {
    return `${JSON.stringify(input, null, '  ')}\n`;
  },
};

/**
 * [package.json] file specific operations.
 */
export const PackageJsonUtil = {
  async load(dir: t.PathString) {
    return JsonUtil.load<t.PkgJson>(PackageJsonUtil.path(dir));
  },

  async save(dir: t.PathString, pkg: t.PkgJson, options: { filename?: string } = {}) {
    await fs.ensureDir(dir);
    await fs.writeFile(PackageJsonUtil.path(dir, options), JsonUtil.stringify(pkg));
  },

  path(dir: t.PathString, options: { filename?: string } = {}) {
    const { filename = 'package.json' } = options;
    dir = (dir || '').trim();
    if (!dir.endsWith(`/${filename}`)) dir = `${dir}/${filename}`;
    return dir;
  },

  deps: {
    get(pkg: t.PkgJson) {
      pkg = R.clone(pkg);
      const dependencies = pkg.dependencies ?? {};
      const devDependencies = pkg.devDependencies ?? {};
      const all = { ...devDependencies, ...dependencies };
      return {
        all,
        dependencies,
        devDependencies,
        exists: (name: string) => Boolean(all[name]),
      };
    },

    set(pkg: t.PkgJson, name: string, version: string, isDev?: boolean) {
      pkg = R.clone(pkg);
      const dependencies = pkg.dependencies ?? (pkg.dependencies = {});
      const devDependencies = pkg.devDependencies ?? (pkg.devDependencies = {});
      if (!isDev) dependencies[name] = version;
      if (isDev) devDependencies[name] = version;
      return pkg;
    },
  },
};
