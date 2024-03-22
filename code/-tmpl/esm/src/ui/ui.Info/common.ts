import { type t } from '../common';
export * from '../common';

/**
 * Constants
 */
const fields = {
  get all(): t.InfoField[] {
    return ['Module', 'Module.Verify', 'Component'];
  },
  get default(): t.InfoField[] {
    return ['Module', 'Module.Verify'];
  },
};

export const DEFAULTS = {
  displayName: 'Info',
  query: { dev: 'dev' },
  fields,
} as const;
