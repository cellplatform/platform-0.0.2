import { SyncDoc } from '.';
import { Doc, Store, Time, describe, expect, it, type t } from '../test';
import { listenToIndex } from './SyncDoc.b.listenToIndex';

describe('network.Webrtc', () => {
  describe('SyncDoc', () => {
    it('getOrCreate', async () => {
      const store = Store.init();
      const doc = await SyncDoc.getOrCreate(store);
      expect(doc.current.shared).to.eql({});
      expect(doc.current['.meta'].ephemeral).to.eql(true);

      const meta = Doc.Meta.get(doc.current);
      expect(meta?.ephemeral).to.eql(true);
      expect(meta?.type?.name).to.eql('crdt.webrtc.SyncDoc');

      store.dispose();
    });

    it('new docs auto-added to index', async () => {
      const store = Store.init();
      const index = await Store.index(store);
      expect(index.total()).to.eql(0);

      const doc = await SyncDoc.getOrCreate(store);

      await Time.wait(0);
      expect(index.total()).to.eql(1);
      expect(index.doc.current.docs[0].uri).to.eql(doc.uri);
    });

    it('purge', async () => {
      const store = Store.init();
      const index = await Store.index(store);

      expect(index.total()).to.eql(0);
      const doc = await SyncDoc.getOrCreate(store);

      await Time.wait(0);
      expect(index.total()).to.eql(1);

      const res = SyncDoc.purge(index);
      expect(index.total()).to.eql(0);
      expect(res).to.eql([doc.uri]);

      store.dispose();
    });
  });

  describe('SyncDoc.Patches', () => {
    const setup = async () => {
      const store = Store.init();
      const index = await Store.index(store);
      const doc = await SyncDoc.getOrCreate(store);

      const events = {
        doc: doc.events(),
        index: index.events(),
      } as const;

      const fired: t.DocChanged<t.WebrtcSyncDoc>[] = [];
      events.doc.changed$.subscribe((e) => fired.push(e));

      return { store, index, doc, events, fired };
    };

    it('Patches.shared', async () => {
      const { store, doc, fired } = await setup();

      const uri = 'automerge:foo';
      doc.change((d) => (d.shared[uri] = { current: true, version: 1 }));
      doc.change((d) => (d.shared[uri] = { current: false, version: 2 }));
      doc.change((d) => delete d.shared[uri]);

      const res1 = SyncDoc.Patches.shared(fired[0]);
      const res2 = SyncDoc.Patches.shared(fired[1]);
      const res3 = SyncDoc.Patches.shared(fired[2]);

      expect(res1.put?.uri).to.eql(uri);
      expect(res1.put?.shared).to.eql(true);
      expect(res1.put?.version).to.eql(1);
      expect(res1.del).to.eql(undefined);

      expect(res2.put?.uri).to.eql(uri);
      expect(res2.put?.shared).to.eql(false);
      expect(res2.put?.version).to.eql(2);
      expect(res2.del).to.eql(undefined);

      expect(res3.put).to.eql(undefined);
      expect(res3.del?.uri).to.eql(uri);
      expect(res3.del?.shared).to.eql(undefined);

      store.dispose();
    });
  });

  describe('SyncDoc.Sync', () => {
    it('listenToIndex: add → rename → remove', async () => {
      const store = Store.init();
      const index = await Store.index(store);
      const doc = await SyncDoc.getOrCreate(store);

      listenToIndex({ index, doc });
      expect(doc.current.shared).to.eql({});

      const uri = 'automerge:foo';
      await index.add({ uri });
      expect(doc.current.shared).to.eql({}); // NB: not yet shared.

      // Share.
      index.doc.change((d) => Store.Index.Mutate.toggleShared(d.docs[1], { value: true }));
      expect(doc.current.shared[uri]).to.eql({ current: true, version: 1 }); // NB: entry now exists on the sync-doc.

      // Remove.
      index.remove(uri);
      expect(doc.current.shared).to.eql({});

      store.dispose();
    });

    it('Sync.all (pre-existing index)', async () => {
      const store = Store.init();
      const index = await Store.index(store);
      const doc = await SyncDoc.getOrCreate(store);

      await index.add({ uri: 'automerge:a' }); // Not shared.
      await index.add({ uri: 'automerge:b' });
      await index.add({ uri: 'automerge:c' });

      index.doc.change((d) => (d.docs[2].name = 'hello'));
      index.doc.change((d) => Store.Index.Mutate.toggleShared(d.docs[2], { value: true }));
      index.doc.change((d) => Store.Index.Mutate.toggleShared(d.docs[3], { value: true }));

      // Ensure the syncer updated the doc.
      SyncDoc.Sync.indexToDoc(index, doc);
      const shared = doc.current.shared;
      expect(shared['automerge:a']).to.eql(undefined);
      expect(shared['automerge:b']).to.eql({ current: true, version: 1 });
      expect(shared['automerge:c']).to.eql({ current: true, version: 1 });

      store.dispose();
    });
  });
});
