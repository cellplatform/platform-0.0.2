import { useEffect, useState } from 'react';

import { Color, COLORS, css, State, t, useClickOutside } from '../common';
import { VideoDiagram } from '../VideoDiagram';

export type OverlayFrameProps = {
  instance: t.StateInstance;
  style?: t.CssValue;
};

export const OverlayFrame: React.FC<OverlayFrameProps> = (props) => {
  const { instance } = props;

  const outside = useClickOutside((e) => State.withEvents(instance, (e) => e.overlay.close()));

  const [isOver, setOver] = useState(false);
  const over = (isOver: boolean) => () => setOver(isOver);

  const [isOverBody, setOverBody] = useState(false);
  const overBody = (isOver: boolean) => () => setOverBody(isOver);

  const isOverGutter = isOver && !isOverBody;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      backgroundColor: Color.format(0.8),
      backdropFilter: `blur(${isOverGutter ? 5 : 40}px)`,
    }),
    body: css({
      Absolute: 30,
      backgroundColor: COLORS.WHITE,
      borderRadius: 8,
      boxSizing: 'border-box',
      padding: 30,
      overflow: 'hidden',
      boxShadow: `0 0 60px 0 ${Color.format(-0.1)}`,
      border: `solid 1px ${Color.alpha(COLORS.DARK, 0.3)}`,
      '@media (max-width: 1100px)': { opacity: 0, pointerEvents: 'none' },
      opacity: isOverGutter ? 0.5 : 1,
      transition: `opacity 350ms`,
    }),
  };

  return (
    <div {...css(styles.base, props.style)} onMouseEnter={over(true)} onMouseLeave={over(false)}>
      <div
        {...styles.body}
        ref={outside.ref}
        onMouseEnter={overBody(true)}
        onMouseLeave={overBody(false)}
      >
      </div>
    </div>
  );
};
