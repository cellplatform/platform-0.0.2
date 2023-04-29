import type { t } from '../common.t';

type Id = string;
type Milliseconds = number;
type Semver = string;

export type WebRtcInfo = {
  module: { name: string; version: Semver };
  peer: t.Peer;
  state: t.NetworkSharedDocRef;
  syncers: t.WebRtcStateSyncer[];
};

export type WebRtcStateSyncer = {
  local: t.PeerId;
  remote: t.PeerId;
  syncer: t.CrdtDocSync<t.NetworkSharedDoc>;
};

/**
 * EVENT (API)
 */
export type WebRtcEvents = t.Disposable & {
  $: t.Observable<t.WebRtcEvent>;
  instance: { bus: Id; id: t.PeerId };
  disposed: boolean;

  info: {
    req$: t.Observable<t.WebRtcInfoReq>;
    res$: t.Observable<t.WebRtcInfoRes>;
    fire(options?: { timeout?: Milliseconds }): Promise<WebRtcInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<WebRtcInfo | undefined>;
  };

  connect: {
    req$: t.Observable<t.WebRtcConnectReq>;
    start$: t.Observable<t.WebRtcConnectStart>;
    complete$: t.Observable<t.WebRtcConnectComplete>;
    fire(remote: t.PeerId, options?: { timeout?: Milliseconds }): Promise<WebRtcConnectComplete>;
  };

  connections: {
    changed: {
      $: t.Observable<t.PeerConnectionChanged>;
      added$: t.Observable<t.PeerConnectionChanged>;
      removed$: t.Observable<t.PeerConnectionChanged>;
      data: {
        $: t.Observable<t.PeerDataConnection>;
        added$: t.Observable<t.PeerDataConnection>;
        removed$: t.Observable<t.PeerDataConnection>;
      };
      media: {
        $: t.Observable<t.PeerMediaConnection>;
        added$: t.Observable<t.PeerMediaConnection>;
        removed$: t.Observable<t.PeerMediaConnection>;
      };
    };
  };

  errors: {
    $: t.Observable<t.WebRtcError>;
    peer$: t.Observable<t.PeerError>;
  };

  prune: {
    req$: t.Observable<t.WebRtcPrunePeersReq>;
    res$: t.Observable<t.WebRtcPrunePeersRes>;
    fire(options?: { timeout?: Milliseconds }): Promise<t.WebRtcPrunePeersRes>;
  };
};

/**
 * EVENT (DEFINITIONS)
 */
export type WebRtcEvent =
  | WebRtcInfoReqEvent
  | WebRtcInfoResEvent
  | WebRtcErrorEvent
  | WebRtcConnectReqEvent
  | WebRtcConnectStartEvent
  | WebRtcConnectCompleteEvent
  | WebRtcConnectionsChangedEvent
  | WebRtcPrunePeersReqEvent
  | WebRtcPrunePeersResEvent;

/**
 * Module info.
 */
export type WebRtcInfoReqEvent = {
  type: 'sys.net.webrtc/info:req';
  payload: WebRtcInfoReq;
};
export type WebRtcInfoReq = { tx: string; instance: t.PeerId };

export type WebRtcInfoResEvent = {
  type: 'sys.net.webrtc/info:res';
  payload: WebRtcInfoRes;
};
export type WebRtcInfoRes = {
  tx: string;
  instance: t.PeerId;
  info?: WebRtcInfo;
  error?: string;
};

/**
 * Error event
 */
export type WebRtcErrorEvent = {
  type: 'sys.net.webrtc/error';
  payload: WebRtcError;
};
export type WebRtcError = WebRtcErrorPeer;

export type WebRtcErrorPeer = {
  instance: t.PeerId;
  kind: 'Peer';
  error: t.PeerError;
};

/**
 * Fires when a network connection initiates.
 */
export type WebRtcConnectReqEvent = {
  type: 'sys.net.webrtc/connect:req'; // NB: [WebRtcConnectCompleteEvent] fires as response.
  payload: WebRtcConnectReq;
};
export type WebRtcConnectReq = {
  tx: string;
  instance: t.PeerId;
  remote: t.PeerId;
};

/**
 * Fires when a network connection initiates.
 */
export type WebRtcConnectStartEvent = {
  type: 'sys.net.webrtc/connect:start';
  payload: WebRtcConnectStart;
};
export type WebRtcConnectStart = {
  tx: string;
  instance: t.PeerId;
  peer: { local: t.PeerId; remote: t.PeerId };
  state: t.NetworkState;
};

/**
 * Fires when a network connection completes
 */
export type WebRtcConnectCompleteEvent = {
  type: 'sys.net.webrtc/connect:complete';
  payload: WebRtcConnectComplete;
};
export type WebRtcConnectComplete = {
  tx: string;
  instance: t.PeerId;
  peer: { local: t.PeerId; remote: t.PeerId };
  state: t.NetworkState;
  error?: string;
};

/**
 * Connection changed.
 */
export type WebRtcConnectionsChangedEvent = {
  type: 'sys.net.webrtc/conns:changed';
  payload: WebRtcConnectionsChanged;
};
export type WebRtcConnectionsChanged = {
  instance: t.PeerId;
  change: t.PeerConnectionChanged;
};

/**
 * Prune dead peers
 */
export type WebRtcPrunePeersReqEvent = {
  type: 'sys.net.webrtc/prune:req';
  payload: WebRtcPrunePeersReq;
};
export type WebRtcPrunePeersReq = { tx: string; instance: t.PeerId };

export type WebRtcPrunePeersResEvent = {
  type: 'sys.net.webrtc/prune:res';
  payload: WebRtcPrunePeersRes;
};
export type WebRtcPrunePeersRes = {
  tx: string;
  instance: t.PeerId;
  removed: t.PeerId[];
  error?: string;
};
