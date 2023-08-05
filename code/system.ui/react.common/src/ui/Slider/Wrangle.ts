import { DEFAULTS, Percent, type t } from './common';

/**
 * Helpers
 */
export const Wrangle = {
  percent(value?: number) {
    return Percent.clamp(value);
  },

  props(props: t.SliderProps) {
    const track = Wrangle.track(props.track);
    const thumb = Wrangle.thumb(props.thumb);
    const ticks = Wrangle.ticks(props.ticks);
    return { track, thumb, ticks } as const;
  },

  elementToPercent(el: HTMLDivElement, clientX: number) {
    const totalWidth = el.offsetWidth;
    const position = clientX - el.getBoundingClientRect().left;
    const res = totalWidth <= 0 ? 0 : Wrangle.percent(position / totalWidth);
    return Number(res.toFixed(3));
  },

  /**
   * Track
   */
  track(props?: Partial<t.SliderTrackProps>): t.SliderTrackProps {
    const DEFAULT = DEFAULTS.track;
    return {
      height: props?.height ?? DEFAULT.height,
      percent: props?.percent,
      color: {
        default: props?.color?.default ?? DEFAULT.color.default,
        highlight: props?.color?.highlight ?? DEFAULT.color.highlight,
        border: props?.color?.border ?? DEFAULT.color.border,
      },
    };
  },

  /**
   * Thumb
   */
  thumb(props?: Partial<t.SliderThumbProps>): t.SliderThumbProps {
    const DEFAULT = DEFAULTS.thumb;
    return {
      size: props?.size ?? DEFAULT.size,
      opacity: props?.opacity ?? DEFAULT.opacity,
      color: props?.color ?? DEFAULT.color,
      pressedScale: props?.pressedScale ?? DEFAULT.pressedScale,
    };
  },

  thumbLeft(percent: t.Percent, totalWidth: t.Pixels, thumbSize: t.Pixels) {
    return (totalWidth - thumbSize) * percent;
  },

  /**
   * Ticks
   */
  ticks(props?: Partial<t.SliderTickProps>): t.SliderTickProps {
    const DEFAULT = DEFAULTS.ticks;
    return {
      offset: props?.offset ?? DEFAULT.offset,
      items: props?.items ?? DEFAULT.items,
    };
  },

  tickItems(input?: t.SliderTickInput[]): t.SliderTick[] {
    if (!Array.isArray(input)) return [];
    const isNumber = (value: any): value is number => typeof value === 'number';
    const isObject = (value: any): value is t.SliderTick => typeof value === 'object';
    return input
      .filter((item) => isNumber(item) || isObject(item))
      .map((value) => (isObject(value) ? value : ({ value } as t.SliderTick)));
  },
} as const;
