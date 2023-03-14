import type { Automerge } from 'sys.data.crdt';
export type { Automerge };

import { WebRtcUtil as Util } from '../WebRtc.Util';
import { peer } from './WebRtc.peer.mjs';
import { Media } from '../WebRtc.Media';

/**
 * Library for working with WebRTC peer-to-peer connections.
 */
export const WebRtc = {
  Media,
  Util,
  peer,
};
