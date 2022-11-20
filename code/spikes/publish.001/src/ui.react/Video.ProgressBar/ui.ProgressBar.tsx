import { useState } from 'react';
import { Color, COLORS, css, R, t, useSizeObserver, Value, Time } from '../common';
import { TimeMap } from './ui.TimeMap';

type Color = string | number;
type Percent = number; // 0..1
export type ProgressBarClickHandler = (e: ProgressBarClickHandlerArgs) => void;
export type ProgressBarClickHandlerArgs = { progress: Percent };

export type ProgressBarProps = {
  timemap?: t.DocTimeWindow[];
  status?: t.VimeoStatus;
  style?: t.CssValue;
  highlightColor?: Color;
  onClick?: ProgressBarClickHandler;
};

export const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  const { status } = props;

  const isPlaying = status?.playing ?? false;
  const duration = status?.duration ?? 0;
  const percent = R.clamp(0, 1, status?.percent ?? 0);
  const highlightColor = Color.format(props.highlightColor ?? COLORS.RED);

  const size = useSizeObserver();
  const [isOver, setOver] = useState(false);
  const over = (isOver: boolean) => () => setOver(isOver);

  /**
   * Handlers
   */
  const handleMouseDown: React.MouseEventHandler = async (e) => {
    const width = size.rect.width;
    if (!size.ready || width <= 0) return;

    const { offsetX } = e.nativeEvent;
    const progress: Percent = Value.round(R.clamp(0, 1, offsetX / width), 3);
    props.onClick?.({ progress });
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      height: 30,
      display: 'flex',
      alignItems: 'center',
    }),
    groove: css({
      flex: 1,
      position: 'relative',
      borderRadius: 10,
      backdropFilter: `blur(5px)`,
      backgroundColor: Color.alpha(COLORS.DARK, isOver ? 0.06 : 0.01),
      border: `solid 1px`,
      borderColor: Color.alpha(COLORS.DARK, isOver ? 0.12 : 0.06),
      height: isOver ? 6 : 2,
      transition: `height 200ms, background-color 200ms, border-color 200ms`,
    }),
    thumb: css({
      borderRadius: 10,
      width: `${percent * 100}%`,
      height: '100%',
      minWidth: 10,
      backgroundColor: isOver || !isPlaying ? highlightColor : Color.alpha(COLORS.DARK, 0.3),
      transition: `background-color 200ms`,
    }),
    timeMap: css({
      Absolute: isOver ? [7, 0, 7, 0] : [10, 0, 10, 0],
      transition: `top 200ms, bottom 200ms`,
    }),
    timeStatus: {
      base: css({
        Absolute: [0, -10, 0, null],
        pointerEvents: 'none',
        width: 0,
        opacity: isOver || !isPlaying ? 1 : 0,
        transition: `opacity 200ms`,
      }),
      inner: css({
        Absolute: [0, null, 0, 0],
        width: 120,
        fontSize: 13,
        Flex: 'y-center-center',
      }),
    },
  };

  const elTimeMap = props.timemap && (
    <TimeMap timemap={props.timemap} duration={duration} isOver={isOver} style={styles.timeMap} />
  );

  const elTimeStatus = status && (
    <div {...styles.timeStatus.base}>
      <div {...styles.timeStatus.inner}>{Wrangle.toTimeStatusString(status)}</div>
    </div>
  );

  return (
    <div
      ref={size.ref}
      {...css(styles.base, props.style)}
      onMouseEnter={over(true)}
      onMouseLeave={over(false)}
      onMouseDown={handleMouseDown}
    >
      <div {...styles.groove}>
        <div {...styles.thumb} />
      </div>
      {elTimeMap}
      {elTimeStatus}
    </div>
  );
};

/**
 * [Helpers]
 */

const Wrangle = {
  toTimeStatusString(status?: t.VimeoStatus) {
    if (!status) return '';
    const seconds = Value.round(status.seconds, 0);
    const duration = Value.round(status.duration, 0);
    return `${seconds}s of ${Time.duration(duration * 1000).toString()}`;
  },
};
