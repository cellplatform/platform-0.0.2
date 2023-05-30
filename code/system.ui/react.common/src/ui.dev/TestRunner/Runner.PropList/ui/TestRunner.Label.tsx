import { css, DevIcons, t } from '../common';

export type TestRunnerLabelProps = {
  title?: string;
  infoUrl?: string;
  style?: t.CssValue;
};

export const TestRunnerLabel: React.FC<TestRunnerLabelProps> = (props) => {
  const { title = 'Verify', infoUrl } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    link: css({ Absolute: [0, -16, 0, null] }),
  };

  const tooltip = 'Show test runner in full-screen mode.';
  const elInfo = infoUrl && (
    <a
      {...styles.link}
      href={infoUrl}
      target={'_blank'}
      rel={'noopener noreferrer'}
      title={tooltip}
    >
      <DevIcons.Info size={14} color={-0.3} offset={[0, 0]} />
    </a>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {title}
      {elInfo}
    </div>
  );
};
