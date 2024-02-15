import { eventsFactory } from './Shared.Events';
import { Mutate } from './Shared.Mutate';
import { Patches } from './Shared.Patches';
import { Sync } from './Shared.Sync';
import { listenToIndex } from './Shared.b.listenToIndex';
import { listenToShared } from './Shared.b.listenToShared';
import { Doc, UserAgent, rx, type t } from './common';

/**
 * An ephemeral (non-visual) document used to sync
 * index and other shared state over network connections.
 */
export const Shared = {
  Sync,
  Patches,
  Mutate,

  get type(): t.DocMetaType {
    const name: t.CrdtSharedState['kind'] = 'crdt.network.shared';
    return { name };
  },

  get meta(): t.DocMeta {
    const type = Shared.type;
    return { ...Doc.Meta.default, type, ephemeral: true };
  },

  /**
   * Get or create a [Shared] document type from the given store.
   */
  async getOrCreate(store: t.Store, uri?: string) {
    return store.doc.getOrCreate<t.CrdtShared>((d) => {
      Doc.Meta.ensure(d, Shared.meta);
      d.sys = { peers: {}, docs: {} };
      d.ns = {};
    }, uri);
  },

  /**
   * Setup a new ephemeral document manager for a store/peer.
   */
  async init(args: {
    $: t.Observable<t.WebrtcStoreEvent>;
    peer: t.PeerModel;
    store: t.Store;
    index: t.StoreIndexState;
    debugLabel?: string;
    uri?: string;
    fire?: (e: t.WebrtcStoreEvent) => void;
  }) {
    const { index, peer, store, debugLabel } = args;
    const life = rx.lifecycle([peer.dispose$, store.dispose$]);
    const { dispose, dispose$ } = life;

    /**
     * TODO 🐷 persist / re-use the doc (??), or delete on network disconnect.
     */

    /**
     * Setup the "shared" CRDT syncing document.
     */
    const doc = await Shared.getOrCreate(store, args.uri);
    const fireChanged = (payload: t.DocChanged<t.CrdtShared>) => {
      args.fire?.({
        type: 'crdt:webrtc:shared/Changed',
        payload,
      });
    };

    /**
     * Event Listeners.
     */
    doc.events(dispose$).changed$.subscribe((change) => fireChanged(change));
    listenToIndex(index, doc, { debugLabel, dispose$ });
    listenToShared(doc, index, { debugLabel, dispose$ });

    /**
     * Initialize.
     */
    Sync.indexToShared(index, doc, { debugLabel });
    doc.change((d) => {
      const ua = UserAgent.current;
      const data: t.CrdtSharedPeer = { ua };
      const peers = d.sys?.peers;
      if (peers) peers[peer.id] = data;
    });

    /**
     * API
     */
    let _ns: t.NamespaceManager | undefined;
    const api: t.CrdtSharedState = {
      kind: 'crdt.network.shared',
      store,
      index,
      doc,

      events(dispose$) {
        return eventsFactory({ $: args.$, dispose$: [dispose$, life.dispose$] });
      },

      get namespace() {
        return _ns || (_ns = Shared.namespace(doc));
      },

      /**
       * Lifecycle
       */
      dispose,
      dispose$,
      get disposed() {
        return life.disposed;
      },
    };
    return api;
  },

  /**
   * Remove all ephemeral documents from the given repo-index.
   */
  purge(index: t.StoreIndexState) {
    const purged: string[] = [];
    index.doc.change((d) => {
      const docs = Doc.Data.array(d.docs);
      let i = -1;
      while (true) {
        i = d.docs.findIndex((item) => item.meta?.ephemeral);
        if (i < 0) break;
        purged.push(docs[i].uri);
        docs.deleteAt(i);
      }
    });
    return purged;
  },

  /**
   * Construct a namespace-manager to operate on the {ns}
   * field of the [Shared] state document.
   */
  namespace<N extends string = string>(shared: t.DocRef<t.CrdtShared>) {
    type T = t.NamespaceManager<N>;
    return Doc.namespace<t.CrdtShared, N>(shared, ['ns'], (d) => (d.ns = {})) as T;
  },
} as const;
