import { Command } from './Command';
import { Is } from './PatchState.Is';
import { init } from './PatchState.init';

/**
 * Simple safe/immutable memory state for a single item.
 */
export const PatchState = {
  init,
  Is,
  Command,
} as const;
