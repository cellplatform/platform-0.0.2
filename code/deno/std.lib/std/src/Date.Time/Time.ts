import { type t } from '../common.ts';
import { delay } from '@std/async';


/**
 * Helpers for working with time/delays.
 */
export const Time: t.TimeLib = {
  delay(...args: any[]) {
    type T = t.TimeDelayPromise;

    const { msecs, fn } = wrangle.delayArgs(args);
    const controller = new AbortController();
    const { signal } = controller;

    const cancel = () => controller.abort('delay cancelled');
    const is: t.DeepMutable<T['is']> = { completed: false, cancelled: false, done: false };

    const res: any = new Promise<void>(async (resolve) => {
      const complete = () => {
        is.done = true;
        is.cancelled = signal.aborted;
        resolve();
      };
      try {
        await delay(msecs, { signal });
        fn?.();
        is.completed = true;
        complete();
      } catch (error) {
        complete();
      }
    });

    // Decorate the promise with extra fields.
    res.cancel = cancel;
    res.is = is;
    res.timeout = msecs;
    return res as T;
  },
};

/**
 * Helpers
 */
const wrangle = {
  delayArgs(input: any[]) {
    let msecs = 0;
    let fn: t.TimeDelayCallback | undefined;
    if (typeof input[0] === 'number') msecs = input[0];
    if (typeof input[0] === 'function') fn = input[0];
    if (typeof input[1] === 'function') fn = input[1];
    return { msecs, fn };
  },
} as const;
