import { build } from 'vite';
import type { UserConfigFn, ConfigEnv } from 'vite';

import { fs, t, Util, R } from '../common/index.mjs';
import { Template } from '../Template.mjs';
import { Paths } from '../Paths.mjs';

/**
 * Refs:
 * - https://vitejs.dev/guide/api-javascript.html#build
 */
export const Vite = {
  /**
   * Generate the [dist] module compilation output.
   * Run the ESM/JS bundler (Vite => Rollup)
   */
  async build(root: t.DirString, options: { silent?: boolean } = {}) {
    root = fs.resolve(root);

    // Load base configuration.
    const { config, targets } = await Vite.loadConfig(root);
    config.root = root;
    config.logLevel = options.silent ? 'silent' : undefined;
    config.build!.outDir = 'dist/web';

    const targetConfig = (target: t.ViteTarget) => {
      const clone = R.clone(config);
      clone.build!.outDir = Paths.outDir.target(target);
      return clone;
    };

    for (const target of targets) {
      const config = targetConfig(target);
      await build(config);
    }

    // Finish up.
    return { ok: true, errorCode: 0 };
  },

  /**
   * Loads the vite generated manifest file.
   */
  async loadManifest(dist: t.DirString) {
    const path = fs.join(dist, Paths.viteBuildManifest);
    if (!(await fs.pathExists(path))) throw new Error(`Vite manifest not found: ${path}`);
    const manifest = await Util.Json.load<t.ViteManifest>(path);
    const files = Object.keys(manifest).map((path) => manifest[path]);
    return { manifest, files };
  },

  /**
   * Dynamically load the [config.mts] function.
   */
  async loadConfig(root: t.DirString, env?: ConfigEnv) {
    root = fs.resolve(root);
    await Template.ensureExists('config', root);

    const path = fs.join(root, Paths.tmpl.config);
    const fn = (await import(path)).default as UserConfigFn;
    if (typeof fn !== 'function')
      throw new Error(`The Vite configuration function has not been default exported. ${path}`);

    const args = env ?? { command: 'build', mode: 'production' };
    const config = await Promise.resolve(fn(args));

    const targets: t.ViteTarget[] = (config as any).__targets ?? ['web'];
    delete (config as any).__targets;

    return { config, targets };
  },

  /**
   * Remove all generated build manifest files.
   */
  async deleteBuildManifests(root: t.DirString) {
    const pattern = fs.resolve(root, '**', Paths.viteBuildManifest);
    const paths = await fs.glob(pattern);
    await Promise.all(paths.map((path) => fs.remove(path)));
  },
};
