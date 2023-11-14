import { WebStore } from '.';
import { Time, A, Test, TestDb, expect, toObject, type t, Value } from '../test.ui';

type D = { count?: t.A.Counter };

export default Test.describe('Store.Web: Index', (e) => {
  const name = TestDb.name.test;
  const initial: t.ImmutableNext<D> = (d) => (d.count = new A.Counter(0));
  const contains = (docs: t.RepoIndexItem[], uri: string) => docs.some((e) => e.uri === uri);

  e.it('disposes of Index events when store/repo is disposed', async (e) => {
    const store = WebStore.init({ network: false, storage: { name } });
    const index = await WebStore.index(store);
    const events = index.doc.events();

    store.dispose();
    expect(events.disposed).to.eql(true); // NB: because parent store disposed.
  });

  e.it('multiple instances from store yield same index URI', async (e) => {
    const store = WebStore.init({ network: false, storage: { name } });

    const indexes: t.StoreIndex[] = [];
    await Promise.all(
      Array.from({ length: 10 }).map(async (item) => {
        await Time.wait(Value.random(0, 250));
        indexes.push(await WebStore.index(store));
      }),
    );

    const uri = indexes[0].doc.uri;
    const every = indexes.every((store) => store.doc.uri === uri);
    expect(every).to.eql(true);
  });

  e.describe('auto sync with repo', (e) => {
    e.it('repo: on ⚡️ new document event → adds to index', async (e) => {
      const store = WebStore.init({ network: false, storage: { name } });
      const index = await WebStore.index(store);
      const events = index.doc.events();

      const fired: t.RepoIndex[] = [];
      events.changed$.subscribe((e) => fired.push(toObject(e.doc)));

      const sample = await store.doc.getOrCreate(initial);
      expect(index.exists(sample.uri)).to.eql(true);

      const docs = fired[0].docs;
      expect(fired.length).to.eql(1);
      expect(docs[docs.length - 1].uri).to.eql(sample.uri); // NB: added to end.
      expect(contains(fired[0].docs, sample.uri)).to.eql(true);

      store.dispose();
    });

    e.it('repo: on ⚡️ delete document event → removes from index', async (e) => {
      const store = WebStore.init({ network: false, storage: { name } });
      const index = await WebStore.index(store);
      const events = index.doc.events();

      const fired: t.RepoIndex[] = [];
      events.changed$.subscribe((e) => fired.push(toObject(e.doc)));

      const sample = await store.doc.getOrCreate(initial);
      expect(index.exists(sample.uri)).to.eql(true);

      const docs = fired[0].docs;
      expect(docs[docs.length - 1].uri).to.eql(sample.uri); // NB: added to end.

      store.repo.delete(sample.uri);
      expect(contains(index.doc.current.docs, sample.uri)).to.eql(false);

      expect(fired.length).to.eql(2);
      expect(contains(fired[1].docs, sample.uri)).to.eql(false);
      expect(index.exists(sample.uri)).to.eql(false);

      store.dispose();
    });
  });
});
