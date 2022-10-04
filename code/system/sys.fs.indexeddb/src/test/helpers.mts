import { t } from '../common/index.mjs';

export const deleteAll = async (fs: t.FsIndexedDb) => {
  const manifest = await fs.driver.indexer.manifest();
  for (const file of manifest.files) {
    await fs.driver.io.delete(`path:${file.path}`);
  }
};
