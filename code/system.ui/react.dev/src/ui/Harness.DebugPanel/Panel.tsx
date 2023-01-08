import { css, R, t, useCurrentState } from '../common';
import { DebugPanelFooter as Footer, DebugPanelHeader as Header } from './Panel.Bar';
import { DebugPanelBody as Body } from './Panel.Body';

export type DebugPanelProps = {
  instance: t.DevInstance;
  style?: t.CssValue;
};

export const DebugPanel: React.FC<DebugPanelProps> = (props) => {
  const { instance } = props;

  const current = useCurrentState(instance, { distinctUntil });
  const debug = current.info?.render.props?.debug;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      overflow: 'hidden',
      justifySelf: 'stretch',

      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
    }),
    body: css({
      Scroll: debug?.body.scroll,
      padding: debug?.body.padding,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Header instance={instance} current={debug?.header} />
      <div {...styles.body}>
        <Body instance={instance} current={current.info} />
      </div>
      <Footer instance={instance} current={debug?.footer} />
    </div>
  );
};

/**
 * Helpers
 */
const distinctUntil = (p: t.DevInfoChanged, n: t.DevInfoChanged) => {
  const prev = p.info;
  const next = n.info;
  if (prev.run.results?.tx !== next.run.results?.tx) return false;
  if (!R.equals(prev.render.revision, next.render.revision)) return false;
  return true;
};
