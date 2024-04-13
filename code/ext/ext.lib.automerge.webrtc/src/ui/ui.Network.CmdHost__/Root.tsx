import { DEFAULTS, FC, type t } from './common';
import { View } from './ui';

/**
 * Export
 */
type Fields = { DEFAULTS: typeof DEFAULTS };
export const Root = FC.decorate<t.NetworkCmdhost, Fields>(
  View,
  { DEFAULTS },
  { displayName: DEFAULTS.displayName },
);