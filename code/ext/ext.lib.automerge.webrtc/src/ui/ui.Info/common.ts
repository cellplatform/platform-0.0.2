import { Doc, Pkg, type t } from '../common';
export { Info as AutomergeInfo } from 'ext.lib.automerge';
export { Info as PeerInfo } from 'ext.lib.peerjs';

export * from '../common';
export { usePeerMonitor, useShared, useTransmitMonitor } from '../use';

/**
 * Constants
 */
const uri: Required<t.InfoDataDocUri> = {
  shorten: [4, 4],
  prefix: 'crdt:automerge',
  clipboard: (uri) => Doc.Uri.id(uri),
};

const fields = {
  get all(): t.InfoField[] {
    return [
      'Visible',
      'Module',
      'Module.Verify',
      'Component',
      'Peer',
      'Peer.Remotes',
      'Repo',
      'Network.Shared',
      'Network.Transfer',
    ];
  },
  get default(): t.InfoField[] {
    return ['Module', 'Module.Verify'];
  },
};

export const DEFAULTS = {
  displayName: `${Pkg.name}.Info`,
  fields,
  doc: { uri },
  query: { dev: 'dev' },
  shared: { label: 'Shared State', dotMeta: false },
} as const;
