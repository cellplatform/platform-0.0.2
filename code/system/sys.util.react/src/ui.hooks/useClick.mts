import { RefObject, useEffect, useRef } from 'react';

type E = HTMLElement;
type Stage = 'down' | 'up';
type EventName = 'mousedown' | 'mouseup';

type Callback = (e: MouseEvent) => void;
type Args<T extends E> = {
  stage?: Stage;
  ref?: RefObject<T>;
  callback?: Callback;
};

const DEFAULT_STAGE: Stage = 'down';

/**
 * Monitors for click events outside the given element.
 * Usage:
 *    Useful for clicking away from modal dialogs or popups.
 */
export function useClickOutside<T extends E = HTMLDivElement>(input: Args<T> | Callback) {
  const { callback, stage, ref, event } = Wrangle.args(input);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current?.contains(e.target as E)) callback?.(e);
    };
    document?.addEventListener(event, handler, true);
    return () => document?.removeEventListener(event, handler, true);
  }, [event, ref, callback]);

  return { ref, stage };
}

/**
 * Monitors for click events within the given element.
 * Usage:
 *    Useful for clicking away from modal dialogs or popups.
 */
export function useClickInside<T extends E = HTMLDivElement>(input: Args<T> | Callback) {
  const { callback, stage, ref, event } = Wrangle.args(input);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && ref.current?.contains(e.target as E)) callback?.(e);
    };
    document?.addEventListener(event, handler, true);
    return () => document?.removeEventListener(event, handler, true);
  }, [event, ref, callback]);

  return { ref, stage };
}

/**
 * Helpers
 */

const Wrangle = {
  args<T extends E>(input: Args<T> | Callback) {
    const { callback, stage = DEFAULT_STAGE, ref = useRef<T>(null) } = Wrangle.input(input);
    const event = Wrangle.eventName(stage);
    return { callback, event, ref, stage };
  },

  input<T extends E>(input: Args<T> | Callback): Args<T> {
    if (typeof input === 'object') return input;
    if (typeof input === 'function') return { callback: input };
    throw new Error('Unable to parse parameter input');
  },

  eventName(stage: Stage): EventName {
    if (stage === 'down') return 'mousedown';
    if (stage == 'up') return 'mouseup';
    throw new Error(`'${stage}' not supported`);
  },
};
