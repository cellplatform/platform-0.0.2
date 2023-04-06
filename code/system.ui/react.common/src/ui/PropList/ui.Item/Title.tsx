import { Style, css, DEFAULTS, t, Wrangle } from './common';

export type PropListTitleProps = {
  data?: t.PropListTitleInput;
  defaults: t.PropListDefaults;
  theme?: t.PropListTheme;
  style?: t.CssValue;
};

export const PropListTitle: React.FC<PropListTitleProps> = (props) => {
  const { value, ellipsis = true, margin = [0, 0, 10, 0] } = Wrangle.title(props.data);
  const content = Wrangle.titleValue(value);
  const theme = Wrangle.theme(props.theme);

  if (!content[0] && !content[1]) return null;

  const styles = {
    base: css({
      flex: 1,
      boxSizing: 'border-box',
      position: 'relative',
      ...Style.toPadding(margin),

      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      columnGap: 8,
    }),
    edge: css({
      fontWeight: 'bold',
      fontSize: DEFAULTS.fontSize + 1,
      color: theme.color.base,
    }),
    ellipsis: css({
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
  };

  const edge = css(styles.edge, ellipsis && styles.ellipsis);

  return (
    <div {...css(styles.base, props.style)}>
      <div {...edge}>{content[0]}</div>
      <div />
      <div {...edge}>{content[1]}</div>
    </div>
  );
};
