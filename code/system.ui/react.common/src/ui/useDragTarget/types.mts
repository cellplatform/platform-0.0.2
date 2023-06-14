import type { RefObject } from 'react';

export type Dropped = { files: DroppedFile[]; urls: string[] };
export type DroppedFile = { path: string; data: Uint8Array; mimetype: string };

/**
 * Hook
 */
export type DragTargetHook<T extends HTMLElement> = {
  readonly ref: RefObject<T>;
  readonly isDragOver: boolean;
  readonly isDropped: boolean;
  readonly isEnabled: boolean;
  readonly dropped?: Dropped;
  reset(): void;
};

/**
 * Events
 */
export type DragTargetDropHandler = (e: DragTargetDropHandlerArgs) => void;
export type DragTargetDropHandlerArgs = Dropped;

export type DragTargetOverHandler = (e: DragTargetOverHandlerArgs) => void;
export type DragTargetOverHandlerArgs = { isOver: boolean };
