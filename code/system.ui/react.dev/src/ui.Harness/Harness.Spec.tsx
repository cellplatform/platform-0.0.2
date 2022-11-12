import { Color, COLORS, css, t, rx, FC } from '../common';

export type HarnessSpecProps = {
  results?: t.TestSuiteRunResponse;
  style?: t.CssValue;
};

export const HarnessSpec: React.FC<HarnessSpecProps> = (props) => {
  const { results } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      flex: 1,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      overflow: 'hidden',
    }),

    pre: css({
      fontSize: 12,
    }),
  };

  const json = props.results ? JSON.stringify(props.results, null, '..') : '';
  const elPre = json && <pre {...styles.pre}>{json} </pre>;

  return (
    <div {...css(styles.base, props.style)}>
      <div>{'🎾 Harness.Specs'}</div>
      <div>{elPre}</div>
    </div>
  );
};
