import { t } from './common';

/**
 * Centralises a set of state change modification helpers
 * that do not rise to the level of needing to have their own
 * bus events defined (or are exploratory and the event structure
 * has not yet been worked out).
 */
export const StateChange = {
  /**
   * Toggle the global media "MUTED/UNMUTED" state.
   */
  async toggleMute(state: t.StateEvents) {
    const current = (await state.info.get()).info?.current;
    const prev = current?.env.media.muted ?? false;
    const next = !prev;

    const commit = `Toggle media volume mute (to ${next ? 'muted' : 'unmuted'})`;
    await state.change.fire(commit, (state) => (state.env.media.muted = next));
  },
};
