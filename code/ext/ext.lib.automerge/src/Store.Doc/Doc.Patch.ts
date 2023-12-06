import { patch } from '@onsetsoftware/automerge-patcher';
import { type t } from './common';

/**
 * Helpers to apply and invert patches generated by Automerge document changes.
 * See:
 *    https://github.com/onsetsoftware/automerge-patcher
 */
export const DocPatch = {
  /**
   * Apply one or more patches to a document.
   * NOTE: Do this within a [change] mutator function.
   */
  apply<T>(doc: T, changeset: t.Patch | t.Patch[]) {
    const items = Array.isArray(changeset) ? changeset : [changeset];
    items.forEach((change) => patch<T>(doc, change));
  },
} as const;