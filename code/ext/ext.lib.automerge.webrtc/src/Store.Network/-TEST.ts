import { WebrtcStore } from '.';
import {
  Test,
  TestDb,
  Time,
  WebStore,
  Webrtc,
  expect,
  expectRoughlySame,
  type t,
} from '../test.ui';

type D = { count: number };

export default Test.describe('WebrtcStore (NetworkAdapter)', (e) => {
  e.timeout(5000);

  type TParts = Awaited<ReturnType<typeof setup>>;
  const setup = async (debugLabel?: string) => {
    const peer = Webrtc.peer();
    const events = peer.events();
    const storage = TestDb.Unit.name;
    const store = WebStore.init({ storage, network: [] });
    const generator = store.doc.factory<D>((d) => (d.count = 0));

    const index = await WebStore.index(store);
    const network = await WebrtcStore.init(peer, store, index, { debugLabel });

    const added: t.WebrtcStoreAdapterAdded[] = [];
    const messages: t.WebrtcMessageAlert[] = [];
    network.added$.subscribe((e) => added.push(e));
    network.message$.subscribe((e) => messages.push(e));

    const dispose = () => {
      peer.dispose();
      store.dispose();
      network.dispose();
    };

    return {
      peer,
      events,
      store,
      generator,
      network,
      fired: { added, messages },
      dispose,
    } as const;
  };

  e.describe('🍌 Integration Test (Network Sequence)', (e) => {
    let self: TParts;
    let remote: TParts;
    const wait = (msecs = 500) => Time.wait(msecs);

    e.it('connect peer to network', async (e) => {
      self = await setup();
      await wait();
      remote = await setup();
      await wait();

      expect(self.network.total.added).to.eql(0);
      expect(remote.network.total.added).to.eql(0);

      const res = await self.peer.connect.data(remote.peer.id);
      expect(res.error).to.eql(undefined);

      expect(self.network.total.added).to.eql(1);
      expect(remote.network.total.added).to.eql(1);

      expect(self.fired.added.length).to.eql(1);
      expect(remote.fired.added.length).to.eql(1);
      expect(self.fired.added[0].conn.id).to.eql(res.id);
      expect(self.fired.added[0].peer).to.eql(self.peer.id);

      expect(remote.fired.added[0].conn.id).to.eql(res.id);
      expect(remote.fired.added[0].peer).to.eql(remote.peer.id);
    });

    e.it('sync document (webrtc / data)', async (e) => {
      const bytesBefore = {
        self: self.network.total.bytes,
        remote: remote.network.total.bytes,
      } as const;

      /**
       * Create a new document.
       */
      const docSelf = await self.generator();
      await wait();
      const docRemote = await remote.generator(docSelf.uri); // NB: knowledge of remote document URI.
      await wait();
      expect(docSelf.current).to.eql({ count: 0 });
      expect(docRemote.current).to.eql({ count: 0 });

      /**
       * Change the document and ensure it syncs over the network connection.
       */
      docRemote.change((d) => (d.count = 123));
      await wait(1000);
      expect(docSelf.current).to.eql({ count: 123 }, 'self synced');
      expect(docRemote.current).to.eql({ count: 123 }, 'remote synced');

      /**
       * Byte count (data transmitted).
       */
      const bytesAfter = {
        self: self.network.total.bytes,
        remote: remote.network.total.bytes,
      } as const;

      const expectGreater = (a: number, b: number, message?: string) => {
        expect(a).to.greaterThanOrEqual(b, message);
      };

      expectGreater(bytesAfter.self.in, bytesBefore.self.in, 'bytes-in (self)');
      expectGreater(bytesAfter.remote.in, bytesBefore.remote.in, 'bytes-in (remote)');
      expectGreater(bytesAfter.self.out, bytesBefore.self.out, 'bytes-out (self)');
      expectGreater(bytesAfter.remote.out, bytesBefore.remote.out, 'bytes-out (remote)');

      expectRoughlySame(bytesAfter.self.in, bytesAfter.remote.in, 0.3, 'bytes-in same(ish)');
      expectRoughlySame(bytesAfter.self.out, bytesAfter.remote.out, 0.3, 'bytes-out same(ish)');
    });

    e.it('ephemeral events', async (e) => {
      const selfDoc = await self.generator();
      await wait();
      const remoteDoc = await remote.generator(selfDoc.uri);
      await wait();

      type TData = { count: number; msg?: string };
      const listenToEphemeral = (doc: t.DocRefHandle<D>) => {
        const events = doc.events();
        const fired = {
          out$: [] as t.DocEphemeralOut<D>[],
          in$: [] as t.DocEphemeralIn<D>[],
          inTyped$: [] as t.DocEphemeralIn<D, TData>[],
        };
        events.ephemeral.in$.subscribe((e) => fired.in$.push(e));
        events.ephemeral.out$.subscribe((e) => fired.out$.push(e));
        events.ephemeral
          .type$<TData>((e) => e.message.count <= 10)
          .subscribe((e) => fired.inTyped$.push(e));
        return fired;
      };

      const fired = {
        self: listenToEphemeral(selfDoc),
        remote: listenToEphemeral(remoteDoc),
      } as const;

      // Broadcast (self → remote).
      selfDoc.handle.broadcast({ count: 0 });
      selfDoc.handle.broadcast({ count: 10 });
      selfDoc.handle.broadcast({ count: 999 });
      await wait(500);

      expect(fired.self.in$.length).to.eql(0);
      expect(fired.self.inTyped$.length).to.eql(0);
      expect(fired.self.out$.length).to.eql(3);

      expect(fired.remote.in$.length).to.eql(3);
      expect(fired.remote.inTyped$.length).to.eql(2);
      expect(fired.remote.out$.length).to.eql(0);

      expect(fired.remote.inTyped$[0].message.count).to.eql(0);
      expect(fired.remote.inTyped$[1].message.count).to.eql(10);
    });

    e.it('dispose', (e) => {
      self.dispose();
      remote.dispose();
    });
  });

  e.describe('WebrtcStore (Network Manager)', (e) => {
    e.it('initialize', async (e) => {
      const { dispose, network, store, peer } = await setup();
      expect(network.total.added).to.eql(0);
      expect(network.store).to.equal(store);
      expect(network.peer).to.equal(peer);
      dispose();
    });

    e.it('dispose: when Peer disposes', async (e) => {
      const { peer, dispose, network } = await setup();
      expect(network.disposed).to.eql(false);
      peer.dispose();
      expect(network.disposed).to.eql(true);
      dispose();
    });

    e.it('dispose: when Store disposes', async (e) => {
      const { store, dispose, network } = await setup();
      expect(network.disposed).to.eql(false);
      store.dispose();
      expect(network.disposed).to.eql(true);
      dispose();
    });
  });
});