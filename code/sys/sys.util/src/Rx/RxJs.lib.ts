import { Subject } from 'rxjs';
export const noop$ = new Subject<any>();

/**
 * Common RXJS
 */
export {
  BehaviorSubject,
  Observable,
  Subject,
  animationFrameScheduler,
  firstValueFrom,
  interval,
  lastValueFrom,
  observeOn,
  of,
  timer,
} from 'rxjs';

export {
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  mergeWith,
  take,
  tap,
  throttleTime,
  timeout,
} from 'rxjs/operators';

/**
 * Alias: shorter name.
 */
import { distinctUntilChanged } from 'rxjs/operators';
export const distinctWhile = distinctUntilChanged;

/**
 * 💦💦
 *
 *    NOTE: The take-until RXJS operator is exported here
 *    to avoid an error occuring when the module is bundled.
 *
 * 💦
 *
 * Error Condition:
 *
 *    const { dispose$ } from rx.disposable()
 *    takeUtil(dispose$)
 *
 * Will throw (as of Sep 2022):
 *
 *    ERROR: "TypeError: You provided an invalid object where a stream was expected."
 *
 * This is realted to the use of Symbols getting munged somehow during bundling within
 * the check RXJS makes of the observable that is passed into the [takeUtil] function.
 *
 */
export { merge } from 'rxjs';
export { takeUntil } from 'rxjs/operators';

/**
 * Factory function for a subject.
 */
export function subject<T = void>() {
  return new Subject<T>();
}
