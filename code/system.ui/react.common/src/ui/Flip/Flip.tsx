import { css, FC, t } from '../common';

type Milliseconds = number;
const DEFAULTS = { speed: 300 };

export type FlipProps = {
  flipped?: boolean;
  speed?: Milliseconds;
  front?: JSX.Element;
  back?: JSX.Element;
  style?: t.CssValue;
};

const View: React.FC<FlipProps> = (props) => {
  const { flipped = false, speed = DEFAULTS.speed } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', perspective: 1000, display: 'grid' }),
    body: css({
      gridRow: 1,
      gridColumn: 1,
      boxSizing: 'border-box',
      backfaceVisibility: 'hidden',
      transition: `transform ${speed}ms ease-out`,
      display: 'grid',
    }),
    front: css({ transform: `rotateY(${flipped ? -180 : 0}deg)` }),
    back: css({ transform: `rotateY(${flipped ? 0 : 180}deg)` }),
    empty: css({
      padding: 10,
      boxSizing: 'border-box',
      fontStyle: 'italic',
      fontSize: 14,
      display: 'grid',
      placeItems: 'center',
      opacity: 0.3,
      userSelect: 'none',
    }),
  };

  const elFront = (
    <div {...css(styles.body, styles.front)}>
      {props.front ?? <div {...css(styles.empty)}>{`Front not provided.`}</div>}
    </div>
  );
  const elBack = (
    <div {...css(styles.body, styles.back)}>
      {props.back ?? <div {...css(styles.empty)}>{`Back not provided.`}</div>}
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elFront}
      {elBack}
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULTS: typeof DEFAULTS;
};
export const Flip = FC.decorate<FlipProps, Fields>(View, { DEFAULTS }, { displayName: 'Flip' });
