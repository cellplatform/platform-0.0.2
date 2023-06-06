import { Duration } from './Duration.mjs';
import { type t } from './common.mjs';

/**
 * Starts a timer.
 */
export function timer(start?: Date, options: { round?: number } = {}) {
  let startedAt = start || new Date();
  const api: t.Timer = {
    startedAt,
    reset() {
      startedAt = new Date();
      return api;
    },
    get elapsed() {
      return elapsed(startedAt, options);
    },
  };
  return api;
}

/**
 * Retrieves the elapsed milliseconds from the given date.
 */
export function elapsed(
  from: t.DateInput,
  options: { to?: t.DateInput; round?: number } = {},
): t.TimeDuration {
  const start = Duration.to.date(from);
  const end = options.to ? Duration.to.date(options.to) : new Date();
  const msec = end.getTime() - start.getTime();
  const precision = options.round === undefined ? 1 : options.round;
  return Duration.create(msec, { round: precision });
}
