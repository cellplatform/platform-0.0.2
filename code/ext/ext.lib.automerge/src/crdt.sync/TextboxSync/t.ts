import type { t } from './common';

export type TextDiff = {
  readonly index: number;
  readonly delCount: number;
  readonly newText?: string;
};

/**
 * A live listener that is syncing an <input> textbox
 * with a CRDT document.
 */
export type TextboxSyncListener = t.Lifecycle & {
  onChange(fn: TextboxSyncChangeHandler): TextboxSyncListener;
};

/**
 * Events
 */
export type TextboxSyncChangeHandler = (e: TextboxSyncChangeHandlerArgs) => void;
export type TextboxSyncChangeHandlerArgs = {
  readonly text: string;
  readonly pos: t.Index;
};
