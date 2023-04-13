import type { t } from '../common.t';

type Id = string;
type Milliseconds = number;

export type CrdtDocSyncOptions<D extends {}> = {
  dispose$?: t.Observable<any>;
  onChange?: t.CrdtDocRefChangeHandler<D>;
  debounce?: Milliseconds;
  syncOnStart?: boolean;
  filedir?: t.Fs;
};

/**
 * Extends a CRDT [DocRef] with peer-sync capabilities.
 */
export type CrdtDocSync<D extends {}> = {
  readonly kind: 'Crdt:DocSync';
  readonly count: number;
  readonly doc: t.CrdtDocRef<D>;
  readonly disposed: boolean;
  readonly dispose$: t.Observable<any>;
  dispose(): Promise<void>;
  update: PeerSyncer<D>['update'];
};

/**
 * Wraps the network synchronization logic for single CRDT
 * document and a set of network peers.
 */
export type PeerSyncer<D extends {}> = {
  readonly count: number;
  readonly bytes: number;
  dispose(): Promise<void>;
  state(): Promise<t.AutomergeSyncState>;
  update(): { tx: Id; complete: Promise<PeerSyncUpdate<D>> };
};

export type PeerSyncUpdate<D extends {}> = {
  tx: Id;
  count: number;
  bytes: number;
  doc: { id: Id; data: D };
};
