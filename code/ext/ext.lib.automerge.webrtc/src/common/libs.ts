/**
 * @external
 */
import { equals } from 'ramda';
export const R = { equals } as const;
export { next as A } from '@automerge/automerge';
export { PeerjsNetworkAdapter } from 'automerge-repo-network-peerjs';

/**
 * @ext
 */
export { Doc, Store, Sync, WebStore, toObject } from 'ext.lib.automerge';

/**
 * @system
 */
export { UserAgent } from 'sys.ui.dom';
export { Delete, Filesize, Hash, ObjectPath, Time, cuid, rx } from 'sys.util';
