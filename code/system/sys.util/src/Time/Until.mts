import { Subject, take, takeUntil } from 'rxjs';
import { create } from '../Dispose/Dispose.create.mjs';
import { delay as baseDelay } from './Delay.mjs';
import { type t } from './common.mjs';

/**
 * Exposes timer functions that cease after a
 * dispose signal is received.
 */
export function until(until$?: t.UntilObservable) {
  let _disposed = false;
  const { dispose, dispose$ } = create(until$);
  dispose$.subscribe(() => (_disposed = true));

  /**
   * API
   */
  const api: t.TimeUntil = {
    /**
     * A more useful (promise based) timeout function.
     */
    // delay,
    delay<T = any>(msecs: number, callback?: () => T): t.TimeDelayPromise<T> {
      const done$ = new Subject<void>();
      const res = baseDelay(msecs, () => {
        done$.next();
        return callback?.() as T;
      });
      dispose$.pipe(takeUntil(done$), take(1)).subscribe(() => res.cancel());
      return res;
    },

    /**
     * Lifecycle.
     */
    dispose,
    dispose$,
    get disposed() {
      return _disposed;
    },
  };

  return api;
}
