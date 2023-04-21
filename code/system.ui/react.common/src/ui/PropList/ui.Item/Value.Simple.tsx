import { Color, COLORS, css, t } from './common';
import { CopyIcon } from './CopyIcon';
import { Wrangle } from '../Util.mjs';

export type SimpleValueProps = {
  defaults: t.PropListDefaults;
  value: t.PropListValue;
  message?: string | JSX.Element;
  cursor?: t.CSSProperties['cursor'];
  isOver?: boolean;
  isCopyable?: boolean;
  theme?: t.PropListTheme;
  onClick: () => void;
};

export const SimpleValue: React.FC<SimpleValueProps> = (props) => {
  const { value, message } = props;

  const is = toFlags(props);
  const textColor = toTextColor(props);
  const cursor = props.cursor ?? is.copyActive ? 'pointer' : 'default';

  const styles = {
    base: css({
      position: 'relative',
      opacity: value.opacity ?? 1,
      transition: 'opacty 100ms ease-out',
      flex: 1,
    }),
    text: css({
      Absolute: 0,
      color: textColor,
      width: '100%',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor,
      textAlign: 'right',
      fontFamily: is.monospace ? 'monospace' : undefined,
      fontWeight: is.monospace ? 'bolder' : undefined,
      fontSize: value.fontSize !== undefined ? value.fontSize : undefined,
    }),
  };

  const text = message ? message : value.data?.toString();

  return (
    <div {...css(styles.base)}>
      <div {...styles.text} onClick={props.onClick}>
        {text}
      </div>
      {is.copyActive && !message && <CopyIcon />}
    </div>
  );
};

/**
 * [Helpers]
 */

function toTextColor(props: SimpleValueProps) {
  if (props.value.color !== undefined) return Color.format(props.value.color);

  const theme = Wrangle.theme(props.theme);
  if (props.message) return theme.color.alpha(0.3);

  const is = toFlags(props);
  if (is.copyActive) return COLORS.BLUE;
  if (is.boolean) return COLORS.PURPLE;

  return theme.color.base;
}

function toFlags(props: SimpleValueProps) {
  const { value, isOver, isCopyable, defaults } = props;
  let monospace = value.monospace ?? defaults.monospace;
  if (typeof value.data === 'boolean') monospace = true;
  return {
    boolean: typeof value.data === 'boolean',
    copyActive: isOver && isCopyable,
    monospace,
  };
}
