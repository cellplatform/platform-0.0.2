import { type t } from './common';

export { Button } from '../Button';
export { Icons } from '../Icons.mjs';
export { Slider } from '../Slider';
export * from '../common';

/**
 * Constants
 */
const axis: t.Axis = 'x';

export const DEFAULTS = {
  split: 0.6,
  axis,
} as const;
