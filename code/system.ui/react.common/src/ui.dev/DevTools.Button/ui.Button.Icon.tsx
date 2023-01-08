import { Color, COLORS, css, t } from '../common';
import { Icons } from '../Icons.mjs';

export type ButtonIconProps = {
  isActive?: boolean;
  isDown?: boolean;
  isOver?: boolean;
  icon?: t.IconRenderer;
  style?: t.CssValue;
};

export const ButtonIcon: React.FC<ButtonIconProps> = (props) => {
  const { isOver, isActive = true } = props;
  const Size = 22;
  const color = isOver && isActive ? COLORS.BLUE : Color.alpha(COLORS.DARK, 0.6);
  const Icon = props.icon ?? Icons.Method;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Size,
      display: 'grid',
      justifyContent: 'center',
      alignContent: 'start',
      opacity: isActive ? 1 : 0.3,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Icon size={Size} color={color} />
    </div>
  );
};
