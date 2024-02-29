import { css, type t } from '../common';
import { DebugPanelBodyRow as Row } from './Panel.Body.Row';

export type DebugPanelBodyrops = {
  instance: t.DevInstance;
  current?: t.DevInfo;
  style?: t.CssValue;
};

export const DebugPanelBody: React.FC<DebugPanelBodyrops> = (props) => {
  const { instance, current } = props;
  const renderers = current?.render?.props?.debug.body.renderers ?? [];

  const styles = { base: css({ position: 'relative' }) };

  const elements = renderers.filter(Boolean).map((renderer) => {
    return <Row key={renderer.id} instance={instance} renderer={renderer} />;
  });

  return <div {...css(styles.base, props.style)}>{elements}</div>;
};
