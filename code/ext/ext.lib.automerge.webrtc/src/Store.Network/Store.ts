import { rx, type t } from './common';

import { WebrtcNetworkAdapter } from './NetworkAdapter';
import { Shared } from './Shared';
import { monitorAdapter } from './u.adapter';

/**
 * Manages the relationship between a [Repo/Store] and a network peer.
 */
export const WebrtcStore = {
  Shared,

  /**
   * Initialize a new network manager.
   */
  async init(
    peer: t.PeerModel,
    store: t.Store,
    index: t.StoreIndexState,
    options: { debugLabel?: string } = {},
  ) {
    const { debugLabel } = options;
    const life = rx.lifecycle([peer.dispose$, store.dispose$]);
    const { dispose, dispose$ } = life;
    const peerEvents = peer.events(dispose$);
    const total = { added: 0, bytes: { in: 0, out: 0 } };

    const fire = (e: t.WebrtcStoreEvent) => $$.next(e);
    const $$ = rx.subject<t.WebrtcStoreEvent>();
    const $ = $$.pipe(rx.takeUntil(dispose$));
    const added$ = rx.payload<t.WebrtcStoreAdapterAddedEvent>($, 'crdt:webrtc/AdapterAdded');
    const message$ = rx.payload<t.WebrtcStoreMessageEvent>($, 'crdt:webrtc/Message');
    const shared$ = rx.payload<t.CrdtSharedChangedEvent>($, 'crdt:shared/Changed');

    /**
     * [Shared] network document setup.
     * Catch before an outbound connection starts and publish the store URI to the document.
     */
    let shared: t.CrdtSharedState | undefined;
    peerEvents.cmd.beforeOutgoing$.subscribe((e) => {
      e.metadata<t.WebrtcStoreConnectMetadata>(async (data) => {
        if (!shared) shared = await Shared.init(peer, store, index, { debugLabel, fire });
        data.shared = shared.doc.uri;
      });
    });

    /**
     * Network peer setup.
     */
    const ready$ = peerEvents.cmd.conn$.pipe(
      rx.filter((e) => e.kind === 'data'),
      rx.filter((e) => e.action === 'ready'),
      rx.filter((e) => Boolean(e.connection?.id && e.direction)),
      rx.map((e) => ({ connid: e.connection?.id!, direction: e.direction! })),
    );

    /**
     * Monitor sync messages.
     */
    message$.subscribe((e) => {
      if (e.message.type === 'sync') {
        const bytes = e.message.data.byteLength;
        if (e.direction === 'incoming') total.bytes.in += bytes;
        if (e.direction === 'outgoing') total.bytes.out += bytes;
      }
    });

    /**
     * Initialize a network adapter for the given connection ID.
     */
    const initAdapter = async (connid: string, direction: t.IODirection) => {
      const conn = peer.get.conn.obj.data(connid);
      if (!conn) throw new Error(`Failed to retrieve WebRTC data-connection with id "${connid}".`);

      /**
       * Lifecycle
       */
      const { dispose$, dispose } = rx.disposable([peer.dispose$, store.dispose$]);
      dispose$.subscribe(() => adapter.disconnect());
      conn.on('close', dispose);

      /**
       * Network adapter.
       */
      const adapter = new WebrtcNetworkAdapter(conn);
      store.repo.networkSubsystem.addNetworkAdapter(adapter);
      monitorAdapter({ adapter, fire, dispose$ });
      total.added += 1;
      fire({
        type: 'crdt:webrtc/AdapterAdded',
        payload: { peer: peer.id, conn: { id: connid, obj: conn }, adapter },
      });

      /**
       * Setup shared-doc.
       */
      if (direction === 'incoming') {
        const metadata = conn.metadata as t.WebrtcStoreConnectMetadata;
        if (metadata.shared) {
          const uri = metadata.shared;
          shared = await Shared.init(peer, store, index, { uri, debugLabel, fire });
        }
      }
    };

    /**
     * API
     */
    const api: t.WebrtcStore = {
      peer,
      store,
      index,

      $,
      added$,
      message$,
      shared$,

      get total() {
        return total;
      },

      get shared() {
        return shared?.doc;
      },

      /**
       * Lifecycle
       */
      dispose,
      dispose$,
      get disposed() {
        return life.disposed;
      },
    } as const;

    /**
     * Finish up.
     */
    ready$.subscribe((e) => initAdapter(e.connid, e.direction));
    return api;
  },
} as const;