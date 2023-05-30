import { css, FC, t, Button, DEFAULTS } from './common';
import { FieldBuilder } from '../FieldBuilder.mjs';
import { PropList } from '../ui/PropList';

import { FieldSelectorLabel } from './FieldSelector.Label';

const View: React.FC<t.PropListFieldSelectorProps> = (props) => {
  const {
    selected = [],
    resettable = DEFAULTS.resettable,
    showIndexes = DEFAULTS.showIndexes,
  } = props;
  const all = [...(props.all ?? [])];
  const isSelected = (field: string) => selected.includes(field);

  /**
   * [Handlers]
   */
  const handleClick = (field: string) => {
    const previous = [...selected];
    const action = selected.includes(field) ? 'Deselect' : 'Select';
    const next = action === 'Select' ? [...selected, field] : selected.filter((f) => f !== field);
    props.onClick?.({ field, action, previous, next });
  };

  const handleReset = (e: React.MouseEvent) => {
    props.onClick?.({
      action: 'Reset',
      previous: [...selected],
      next: e.metaKey ? [] : props.default, // NB: force empty if meta-key, otherwise use defaults.
    });
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
  };

  const items: t.PropListItem[] = all.map((field) => {
    const onClick = () => handleClick(field);
    const label = (
      <FieldSelectorLabel
        field={field}
        all={all}
        selected={selected}
        showIndexes={showIndexes}
        onClick={onClick}
      />
    );
    const value: t.PropListValueSwitch = {
      kind: 'Switch',
      data: isSelected(field),
      onClick,
    };
    return { label, value };
  });

  if (resettable) {
    const el = <Button onClick={handleReset}>{'reset'}</Button>;
    items.push({ label: ``, value: { data: el } });
  }

  return (
    <PropList
      title={props.title}
      items={items}
      defaults={{ clipboard: false }}
      style={css(styles.base, props.style)}
    />
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULTS: typeof DEFAULTS;
  FieldBuilder: typeof FieldBuilder;
};
export const FieldSelector = FC.decorate<t.PropListFieldSelectorProps, Fields>(
  View,
  { DEFAULTS, FieldBuilder },
  { displayName: 'PropList.FieldSelector' },
);
