import { css, DevIcons, type t } from '../common';

type R = t.TestPropListRunData;

export type TestRunnerLabelProps = {
  label?: R['label'];
  infoUrl?: R['infoUrl'];
  style?: t.CssValue;
};

export const TestRunnerLabel: React.FC<TestRunnerLabelProps> = (props) => {
  const label = Wrangle.label(props);
  const infoUrl = Wrangle.infoUrl(props);

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
      {label}
      {elInfo}
    </div>
  );
};

/**
 * [Helpers]
 */

const Wrangle = {
  label(props: TestRunnerLabelProps) {
    const { label = 'Verify' } = props;
    return typeof label === 'function' ? label() : label;
  },
  infoUrl(props: TestRunnerLabelProps) {
    const { infoUrl } = props;
    return typeof infoUrl === 'function' ? infoUrl() : infoUrl;
  },
};
