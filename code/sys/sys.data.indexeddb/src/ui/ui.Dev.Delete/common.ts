import { type t } from './common';
export * from '../common';

/**
 * Constants
 */
const systemSuffix = ':sys';
const filter: t.DevDeleteFilter = (e) => !['fs', `fs${systemSuffix}`].includes(e.name);

export const DEFAULTS = {
  displayName: 'IndexedDb.Dev.Delete',
  filter,
  systemSuffix,
} as const;
