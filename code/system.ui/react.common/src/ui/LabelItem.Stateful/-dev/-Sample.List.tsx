import { LabelItem } from '../../LabelItem';
import { RenderCount } from '../../RenderCount';
import { css, type t } from '../common';

export type SampleListProps = {
  useBehaviors?: t.LabelItemBehaviorKind[];
  list?: t.LabelListState;
  renderers?: t.LabelItemRenderers;
  debug?: { isList?: boolean; renderCount?: boolean };
  style?: t.CssValue;
};

export const SampleList: React.FC<SampleListProps> = (props) => {
  const { useBehaviors, list, renderers, debug = {} } = props;
  const controller = LabelItem.Stateful.useListController({ useBehaviors, list });

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', outline: 'none' }),
  };

  const length = list?.current.total ?? 0;
  const elements = Array.from({ length }).map((_, i) => {
    const [item] = LabelItem.Model.List.getItem(list, i);
    if (!item) return null;
    return (
      <LabelItem.Stateful
        {...controller.handlers}
        key={item.instance}
        index={i}
        total={length}
        list={debug.isList ? list : undefined}
        item={item}
        renderers={renderers}
        useBehaviors={useBehaviors}
        renderCount={debug.renderCount ? itemRenderCount : undefined}
      />
    );
  });

  return (
    <controller.Provider>
      <div ref={controller.ref} {...css(styles.base, props.style)}>
        {debug.renderCount && <RenderCount {...listRenderCount} />}
        <div>{elements}</div>
      </div>
    </controller.Provider>
  );
};

/**
 * Helpers
 */
const itemRenderCount: t.RenderCountProps = { absolute: [0, -55, null, null], opacity: 0.2 };
const listRenderCount: t.RenderCountProps = { absolute: [-18, 0, null, null], opacity: 0.2 };
