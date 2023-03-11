import type { Automerge } from 'sys.data.crdt';
export type { Automerge };

import { WebRTCUtil } from '../WebRTC.Util';
import { peer } from './WebRTC.peer.mjs';
import { Media } from './Media.mjs';

/**
 * Library for working with WebRTC peer-to-peer connections.
 */
export const WebRTC = {
  Util: WebRTCUtil,
  Media,
  peer,
};
