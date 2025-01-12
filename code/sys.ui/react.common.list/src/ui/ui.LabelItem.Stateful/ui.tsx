import { LabelItem } from '../ui.LabelItem/Root';
import { DEFAULTS, type t } from './common';
import { useItemController } from './use';
import { Wrangle } from './Wrangle';

/**
 * Sample of using the behavior controller hooks.
 */
export const View: React.FC<t.LabelItemStatefulProps> = (props) => {
  const { index, list, item, behaviors = DEFAULTS.behaviors.defaults } = props;
  const total = list?.current.total ?? 0;
  const handlers = Wrangle.pluckHandlers(props);

  const isSelected = item && list && list.current.selected === item.instance;
  const isEditing = item && list && list.current.editing === item.instance;
  const isFocused = isSelected && list?.current.focused;

  /**
   * Roll-up controller.
   */
  const controller = useItemController({
    index,
    total,
    list,
    item,
    behaviors,
    handlers,
  });

  /**
   * Render
   */
  return (
    <LabelItem
      {...controller.handlers}
      id={item?.instance}
      index={props.index}
      total={total}
      item={controller.current}
      renderers={controller.renderers ?? props.renderers}
      focused={isFocused}
      selected={isSelected}
      editing={isEditing}
      focusOnEdit={true}
      renderCount={props.renderCount}
      debug={props.debug}
      style={props.style}
    />
  );
};
