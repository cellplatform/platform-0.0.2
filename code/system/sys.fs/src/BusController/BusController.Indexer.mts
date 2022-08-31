import { asArray, Path, t, R, DEFAULT } from './common.mjs';
import { ManifestCache } from './ManifestCache.mjs';

type FilesystemId = string;

/**
 * Event controller.
 */
export function BusControllerIndexer(args: {
  id: FilesystemId;
  bus: t.EventBus<t.SysFsEvent>;
  driver: t.FsDriver;
  indexer: t.FsIndexer;
  events: t.SysFsEvents;
}) {
  const { id, driver, bus, events, indexer } = args;

  /**
   * Manifest.
   */
  events.index.manifest.req$.subscribe(async (e) => {
    const { tx } = e;
    const cachefile = Path.trim(e.cachefile ?? DEFAULT.CACHE_FILENAME);

    const filterPaths: t.FsPathFilter = (e) => {
      if (e.path.endsWith(DEFAULT.CACHE_FILENAME) || e.path.endsWith(cachefile)) return false;
      if (e.path.endsWith('.DS_Store')) return false;
      return true;
    };

    const shouldCache = () => {
      if (e.cache === true) return true;
      if (e.cache === 'force') return true;
      if (e.cache === undefined && e.cachefile !== undefined) return true;
      return false;
    };

    const toErrorResponse = (dir: string, error: string): t.SysFsManifestDirResponse => {
      const message = `Failed while building manifest. ${error ?? ''}`.trim();
      return {
        dir,
        manifest: R.clone(DEFAULT.ERROR_MANIFEST),
        error: { code: 'manifest', message },
      };
    };

    const toManifest = async (path?: string): Promise<t.SysFsManifestDirResponse> => {
      const dir = Path.ensureSlashEnd(path ? Path.join(driver.dir, path) : driver.dir);

      const cache = ManifestCache({ driver, dir, filename: cachefile });
      try {
        if (e.cache === true) {
          const manifest = await cache.read();
          if (manifest) return { dir, manifest };
        }

        const manifest = await indexer.manifest({ dir: path, filter: filterPaths });

        if (shouldCache() && (await cache.dirExists())) {
          await cache.write(manifest);
        }

        if (e.cache === 'remove') {
          await cache.delete();
        }

        return { dir, manifest };
      } catch (error: any) {
        return toErrorResponse(dir, error.message);
      }
    };

    const paths = R.uniq(asArray(e.dir ?? []).map((path) => (path || '').trim() || '/'));
    const dirs = await Promise.all(paths.length === 0 ? [toManifest()] : paths.map(toManifest));

    const hasError = dirs.some((dir) => dir.error);
    const error: t.SysFsError | undefined = hasError
      ? { code: 'manifest', message: `Indexing failed` }
      : undefined;

    bus.fire({
      type: 'sys.fs/manifest:res',
      payload: { tx, id, dirs, error },
    });
  });
}
