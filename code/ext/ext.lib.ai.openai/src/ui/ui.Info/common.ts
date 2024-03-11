import { type t } from '../common';
export * from '../common';

/**
 * Constants
 */
export const DEFAULTS = {
  displayName: 'Info',
  fields: {
    get all(): t.InfoField[] {
      return ['Module', 'Module.Verify', 'Component'];
    },
    get default(): t.InfoField[] {
      return ['Module', 'Module.Verify'];
    },
  },
  query: { dev: 'dev' },
} as const;
