import { Color, COLORS, css, DEFAULTS, R, t, useCurrentState } from '../common';
import { PanelFooter, PanelHeader } from '../Harness.PanelEdge';
import { HostBackground } from './Host.Background';
import { HostComponent } from './Host.Component';
import { HostGrid } from './Host.Grid';
import { HostLayers } from './Host.Layers';
import { BarLoader } from '../Spinners';

const DEFAULT = DEFAULTS.props.host;

export type HarnessHostProps = {
  instance: t.DevInstance;
  style?: t.CssValue;
  baseRef?: React.RefObject<HTMLDivElement>;
  subjectRef?: React.RefObject<HTMLDivElement>;
};

export const HarnessHost: React.FC<HarnessHostProps> = (props) => {
  const { instance } = props;

  const current = useCurrentState(instance, { distinctUntil });
  const renderProps = current.info?.render.props;
  const host = renderProps?.host;
  const layersAbove = Wrangle.layers(host, (i) => i > 0);
  const layersBelow = Wrangle.layers(host, (i) => i < 0);

  /**
   * [Render]
   */
  const cropmark = `solid 1px ${Color.format(host?.tracelineColor ?? DEFAULT.tracelineColor)}`;
  const backgroundColor =
    host?.backgroundColor === undefined
      ? Color.format(DEFAULT.backgroundColor)
      : Color.format(host.backgroundColor);
  const styles = {
    base: css({
      position: 'relative',
      overflow: 'hidden',
      color: COLORS.DARK,
      backgroundColor,
    }),
    body: css({
      Absolute: 0,
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
    }),
    main: css({
      position: 'relative',
      display: 'grid',
    }),
    empty: {
      base: css({ Absolute: 0, display: 'grid', placeContent: 'center', userSelect: 'none' }),
    },
  };

  const elBackground = renderProps && <HostBackground renderProps={renderProps} />;

  const elGrid = renderProps && (
    <HostGrid renderProps={renderProps} border={cropmark}>
      <HostComponent
        instance={instance}
        renderProps={renderProps}
        border={cropmark}
        subjectRef={props.subjectRef}
      />
    </HostGrid>
  );

  const elMain = (
    <div {...styles.main}>
      <HostLayers instance={instance} layers={layersBelow} />
      {elGrid}
      <HostLayers instance={instance} layers={layersAbove} />
    </div>
  );

  const elBody = (
    <div {...styles.body}>
      <PanelHeader instance={instance} current={host?.header} />
      {elMain}
      <PanelFooter instance={instance} current={host?.footer} />
    </div>
  );

  const elEmpty = !renderProps && (
    <div {...styles.empty.base}>
      <BarLoader />
    </div>
  );

  return (
    <div ref={props.baseRef} {...css(styles.base, props.style)}>
      {elBackground}
      {elBody}
      {elEmpty}
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

const Wrangle = {
  layers(host: t.DevRenderPropsHost | undefined, filter: (index: number) => boolean) {
    const obj = host?.layers ?? {};
    const items = Object.keys(obj)
      .map((key) => obj[key])
      .filter((item) => filter(item.index));
    return R.sortBy(R.prop('index'), items);
  },
};
