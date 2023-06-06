import { COLORS, DevIcons, Spinner, css, type t } from '../common';

export type RunIconProps = {
  isSelected?: boolean;
  isOver?: boolean;
  isRunning?: boolean;
  enabled?: boolean;
  iconColor?: string;
  style?: t.CssValue;
};

export const RunIcon: React.FC<RunIconProps> = (props) => {
  const { isSelected, isOver, isRunning, iconColor = COLORS.DARK, enabled = true } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      height: 16,
    }),
    spinner: css({
      Absolute: 0,
      display: 'grid',
      placeItems: 'center',
      height: 16,
    }),
    icon: css({
      display: 'grid',
      justifyContent: 'center',
      alignContent: 'top',
      opacity: Wrangle.spinnerOpacity(props),
      transition: `all 0.3s ease-in-out`,
      color: isOver && isSelected && enabled ? COLORS.BLUE : iconColor,
    }),
  };

  const elSpinner = isRunning && (
    <div {...styles.spinner}>
      <Spinner.Bar color={COLORS.GREEN} width={16} />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <DevIcons.Run.FullCircle.Outline size={16} style={styles.icon} />
      {elSpinner}
    </div>
  );
};

/**
 * Helpers
 */
const Wrangle = {
  spinnerOpacity(props: RunIconProps) {
    if (props.isRunning) return 0;
    return props.isSelected ? 0.8 : 0.25;
  },
};
