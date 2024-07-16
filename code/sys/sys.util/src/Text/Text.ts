import { diff } from './Text.diff';
import { replace, splice } from './Text.splice';

export const Text = {
  diff,
  splice,
  replace,

  /**
   * Limit the length of a string inserting ellipsis when needed.
   */
  shorten(input: string = '', maxLength: number = 10, options: { ellipsis?: string } = {}) {
    const { ellipsis = '…' } = options;
    const text = String(input);
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - ellipsis.length)}${ellipsis}`;
  },
} as const;
