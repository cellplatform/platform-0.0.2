import { useEffect, useState } from 'react';

type E = HTMLElement;

/**
 * Monitor size of an HTML/DOM element.
 *
 * Ref:
 *    Standards API
 *    https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
 *
 */
export function useSizeObserver<T extends E = HTMLDivElement>(refs: React.RefObject<T>[]) {
  const ready = refs.every((ref) => typeof ref.current === 'object');
  const [count, setCount] = useState(0);

  /**
   * Lifecycle
   */
  useEffect(() => {
    let $: ResizeObserver;

    // NB: ensure safe when run in CI on server.
    if (typeof ResizeObserver === 'function') {
      $ = new ResizeObserver((entries) => setCount((prev) => prev + 1));
      const elements = refs.map((ref) => ref.current!).filter(Boolean);
      elements.forEach((el) => $.observe(el));
    }

    /**
     * Dispose
     */
    return () => $?.disconnect();
  }, [ready, refs.length > 0]);

  /**
   * API
   */
  return { ready, refs, count };
}
