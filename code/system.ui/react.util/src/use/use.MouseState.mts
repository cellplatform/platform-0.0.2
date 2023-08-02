import { useState } from 'react';

type M = React.MouseEventHandler;
type Args = {
  onDown?: M;
  onUp?: M;
  onEnter?: M;
  onLeave?: M;
};

/**
 * HOOK: keep track of mouse events for an HTML element
 * Usage:
 *
 *     const mouse = useMouseState();
 *     <div {...mouse.handlers} />
 *
 */
export function useMouseState(args: Args = {}) {
  const [isDown, setDown] = useState(false);
  const [isOver, setOver] = useState(false);

  const down = (isDown: boolean) => (e: React.MouseEvent) => {
    setDown(isDown);
    if (isDown) args.onDown?.(e);
    if (!isDown) args.onUp?.(e);
  };
  const over = (isOver: boolean) => (e: React.MouseEvent) => {
    setOver(isOver);
    if (isOver === false) setDown(false);
    if (isOver) args.onEnter?.(e);
    if (!isOver) args.onLeave?.(e);
  };

  const onMouseDown = down(true);
  const onMouseUp = down(false);
  const onMouseEnter = over(true);
  const onMouseLeave = over(false);

  /**
   * API
   */
  return {
    is: { over: isOver, down: isDown },
    handlers: { onMouseDown, onMouseUp, onMouseEnter, onMouseLeave },
    reset() {
      setDown(false);
      setOver(false);
    },
  } as const;
}
