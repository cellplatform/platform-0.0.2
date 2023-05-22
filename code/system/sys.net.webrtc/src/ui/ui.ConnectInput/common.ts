import type { t } from '../common';

export * from '../common';
export { WebRtcUtils } from '../../WebRtc.Util';

/**
 * Constants
 */
export const FIELDS: t.ConnectInputField[] = ['Peer:Remote', 'Peer:Self', 'Video'];

const fields: t.ConnectInputField[] = ['Peer:Remote', 'Peer:Self'];
export const DEFAULTS = {
  fields,
  spinning: false,
} as const;
