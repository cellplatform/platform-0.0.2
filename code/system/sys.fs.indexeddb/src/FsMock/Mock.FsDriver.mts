import { t } from '../common/index.mjs';

/**
 * A driver used for mocking the file-system while testing.
 */
export function MockFsDriver(options: { dir?: string } = {}) {
  const { dir = '/mock/' } = options;
  const root = dir;

  const TMP = null as any; // TEMP 🐷

  const driver: t.FsDriverLocal = {
    type: 'LOCAL',

    dir,

    resolve: TMP,

    /**
     * Retrieve meta-data of a local file.
     */
    async info(uri) {
      return TMP;
    },

    /**
     * Read from the local file-system.
     */
    async read(uri) {
      return TMP;
    },

    /**
     * Write to the local file-system.
     */
    async write(uri, input) {
      return TMP;
    },

    /**
     * Delete from the local file-system.
     */
    async delete(uri) {
      return TMP;
    },

    /**
     * Copy a file.
     */
    async copy(sourceUri, targetUri) {
      return TMP;
    },
  };

  return { driver };
}
