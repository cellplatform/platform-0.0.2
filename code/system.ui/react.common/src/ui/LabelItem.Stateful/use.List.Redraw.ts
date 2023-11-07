import { useEffect, useState } from 'react';
import { rx, type t, Model } from './common';

/**
 * HOOK: trigger redraws on specific list-model state changes.
 */
export function useListRedrawController(list: t.LabelListState) {
  const [, setCount] = useState(0);
  const redraw = () => setCount((prev) => prev + 1);

  /**
   * Command: "redraw" (entire list).
   */
  useEffect(() => {
    const events = list.events();
    const redrawCommand$ = events.cmd.redraw$.pipe(rx.filter((e) => !e.item));
    const redraw$ = rx.merge(events.total$, redrawCommand$);
    redraw$.pipe(rx.throttleAnimationFrame()).subscribe(redraw);
    return events.dispose;
  }, []);
}