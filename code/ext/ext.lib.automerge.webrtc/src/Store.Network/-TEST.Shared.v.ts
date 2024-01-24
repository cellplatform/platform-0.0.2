import { Doc, Is, Store, Time, describe, expect, it, type t } from '../test';
import { Shared } from './Shared';
import { listenToIndex } from './Shared.b.listenToIndex';
import { listenToShared } from './Shared.b.listenToShared';

describe('Webrtc: Shared', () => {
  describe('Shared', () => {
    it('getOrCreate', async () => {
      const store = Store.init();
      const doc = await Shared.getOrCreate(store);
      expect(doc.current.sys.docs).to.eql({});
      expect(doc.current.sys.peers).to.eql({});
      expect(doc.current.ns).to.eql({});
      expect(doc.current['.meta'].ephemeral).to.eql(true);

      const meta = Doc.Meta.get(doc.current);
      expect(meta?.ephemeral).to.eql(true);
      expect(meta?.type?.name).to.eql(Shared.type.name);

      store.dispose();
    });

    it('new docs auto-added to index', async () => {
      const store = Store.init();
      const index = await Store.index(store);
      expect(index.total()).to.eql(0);

      const doc = await Shared.getOrCreate(store);

      await Time.wait(0);
      expect(index.total()).to.eql(1);
      expect(index.doc.current.docs[0].uri).to.eql(doc.uri);
    });

    it('purge', async () => {
      const store = Store.init();
      const index = await Store.index(store);

      expect(index.total()).to.eql(0);
      const doc = await Shared.getOrCreate(store);

      await Time.wait(0);
      expect(index.total()).to.eql(1);

      const res = Shared.purge(index);
      expect(index.total()).to.eql(0);
      expect(res).to.eql([doc.uri]);

      store.dispose();
    });
  });

  describe('Shared.namespace', () => {
    type N = 'foo' | 'bar';

    it('retrieves {ns} with loosley and strongly typed key', async () => {
      const store = Store.init();
      const doc = await Shared.getOrCreate(store);
      const ns1 = Shared.namespace(doc);
      const ns2 = Shared.namespace<N>(doc);

      expect(Is.namespace(ns1)).to.eql(true);
      expect(Is.namespace(ns2)).to.eql(true);
      expect(ns1).to.not.equal(ns2); // NB: different instance writing the same underlying document.

      const foo = ns1.lens('foo', { count: 123 });
      const bar = ns2.lens('bar', { msg: 'hello' });
      expect(foo.current.count).to.eql(123);
      expect(bar.current.msg).to.eql('hello');
      expect(doc.current.ns).to.eql({ foo: { count: 123 }, bar: { msg: 'hello' } });

      store.dispose();
    });

    it('retrieves shared instances of namespace lens', async () => {
      const store = Store.init();
      const doc = await Shared.getOrCreate(store);
      const ns = Shared.namespace<N>(doc);

      const lens1 = ns.lens('foo', {});
      const lens2 = ns.lens('foo', {});
      const lens3 = ns.lens('bar', {});
      expect(lens1).to.equal(lens2); // NB: same instance retrieved.
      expect(lens1).to.not.equal(lens3);
    });
  });

  describe('Shared.Patches', () => {
    const setup = async () => {
      const store = Store.init();
      const index = await Store.index(store);
      const doc = await Shared.getOrCreate(store);

      const events = {
        doc: doc.events(),
        index: index.events(),
      } as const;

      const fired: t.DocChanged<t.CrdtShared>[] = [];
      events.doc.changed$.subscribe((e) => fired.push(e));

      return { store, index, doc, events, fired };
    };

    it('Patches.shared', async () => {
      const { store, doc, fired } = await setup();

      const uri = 'automerge:foo';
      doc.change((d) => (d.sys.docs[uri] = { shared: true, version: 1 }));
      doc.change((d) => (d.sys.docs[uri] = { shared: false, version: 2 }));
      doc.change((d) => delete d.sys.docs[uri]);

      const res1 = Shared.Patches.shared(fired[0]);
      const res2 = Shared.Patches.shared(fired[1]);
      const res3 = Shared.Patches.shared(fired[2]);

      expect(res1?.uri).to.eql(uri);
      expect(res1?.shared).to.eql(true);
      expect(res1?.version).to.eql(1);

      expect(res2?.uri).to.eql(uri);
      expect(res2?.shared).to.eql(false);
      expect(res2?.version).to.eql(2);

      expect(res3).to.eql(undefined);
      store.dispose();
    });
  });

  describe('Shared.Sync', () => {
    it('Sync.listenToIndex: add → rename → remove', async () => {
      const store = Store.init();
      const index = await Store.index(store);
      const shared = await Shared.getOrCreate(store);

      listenToIndex(index, shared);
      expect(shared.current.sys.docs).to.eql({});

      const uri = 'automerge:foo';
      await index.add({ uri });
      expect(shared.current.sys.docs).to.eql({}); // NB: not yet shared.

      // Share.
      index.doc.change((d) => Store.Index.Mutate.toggleShared(d.docs[1], { shared: true }));
      expect(shared.current.sys.docs[uri]).to.eql({ shared: true, version: 1 }); // NB: entry now exists on the shared-doc.

      // Remove.
      index.remove(uri);
      expect(shared.current.sys.docs[uri].shared).to.eql(false);
      expect(shared.current.sys.docs[uri].version).to.eql(2);
      store.dispose();
    });

    it('Sync.listenToShared', async () => {
      const store = Store.init();
      const index = await Store.index(store);
      const shared = await Shared.getOrCreate(store);
      const get = (uri: string) => shared.current.sys.docs[uri];

      await Time.wait(0);
      listenToShared(shared, index);
      expect(shared.current.sys.docs).to.eql({});

      const uri = 'automerge:foo';
      shared.change((d) => (d.sys.docs[uri] = { shared: false, version: 0 }));

      expect(get(uri)).to.eql({ shared: false, version: 0 });
      shared.change((d) => (d.sys.docs[uri] = { shared: true, version: 1 }));
      expect(get(uri)).to.eql({ shared: true, version: 1 });

      store.dispose();
    });

    it('Sync.indexToShared (all items from pre-existing [Index])', async () => {
      const store = Store.init();
      const index = await Store.index(store);
      const doc = await Shared.getOrCreate(store);

      await index.add({ uri: 'automerge:a' }); // Not shared.
      await index.add({ uri: 'automerge:b' });
      await index.add({ uri: 'automerge:c' });

      const Mutate = Store.Index.Mutate;
      index.doc.change((d) => (d.docs[2].name = 'hello'));
      index.doc.change((d) => Mutate.toggleShared(d.docs[2], { shared: true }));
      index.doc.change((d) => Mutate.toggleShared(d.docs[3], { shared: true }));

      // Ensure the syncer updated the doc.
      Shared.Sync.indexToShared(index, doc);
      const shared = doc.current.sys.docs;
      expect(shared['automerge:a']).to.eql(undefined);
      expect(shared['automerge:b']).to.eql({ shared: true, version: 1 });
      expect(shared['automerge:c']).to.eql({ shared: true, version: 1 });

      store.dispose();
    });

    it('Sync.sharedToIndex', async () => {
      const store = Store.init();
      const index = await Store.index(store);
      const doc = await Shared.getOrCreate(store);

      const Mutate = Store.Index.Mutate;
      await index.add({ uri: 'automerge:a' }); // Not shared.
      await index.add({ uri: 'automerge:b' });
      index.doc.change((d) => Mutate.toggleShared(d.docs[2], { shared: true }));
      Shared.Sync.indexToShared(index, doc);

      // Make change → unshare a document.
      doc.change((d) => {
        d.sys.docs['automerge:b'].shared = false;
        d.sys.docs['automerge:b'].version++;
      });

      // NB: not changed yet.
      expect(index.doc.current.docs[2].shared?.current).to.eql(true);
      expect(index.doc.current.docs[2].shared?.version.value).to.eql(1);

      Shared.Sync.sharedToIndex(doc, index); // ← ✨ function under test.
      expect(index.doc.current.docs[2].shared?.current).to.eql(false);
      expect(index.doc.current.docs[2].shared?.version.value).to.eql(2);

      store.dispose();
    });
  });
});
