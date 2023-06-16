import { Crdt, CrdtInfo } from 'sys.data.crdt';
import { Filesystem } from 'sys.fs.indexeddb';
import { type t } from '../common';

export { Crdt, CrdtInfo };
export type DevDataController = Awaited<ReturnType<typeof DevDataController>>;

const docid = 'dev-image';
type Doc = {
  name: string;
  data?: Uint8Array;
  mimetype?: string;
};
const initial: Doc = { name: 'Untitled' };

/**
 * DEV: controls saving the image to a server.
 */
export async function DevDataController(options: { dispose$?: t.Observable<any> } = {}) {
  const { dispose$ } = options;
  const dir = 'dev/image.sample';
  const fs = (await Filesystem.client({ dir, id: 'fs.dev' })).fs;

  const doc = Crdt.ref<Doc>(docid, initial);
  const file = await Crdt.file<Doc>(fs, doc, { dispose$, autosave: true });

  return {
    dir,
    file,
    render() {
      return render(dir, file);
    },
  } as const;
}

/**
 * Render Info
 */

function render(path: string, file: t.CrdtDocFile<Doc>) {
  const doc = file.doc;
  return (
    <CrdtInfo
      margin={[30, 25, 30, 30]}
      fields={['Module', 'History', 'History.Item', 'History.Item.Message', 'File', 'File.Driver']}
      data={{
        file: { doc: file, path },
        history: {
          data: doc.history,
          // item: { title: 'Latest Change', data: doc.history[doc.history.length - 1] },
        },
      }}
    />
  );
}
