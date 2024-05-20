import { DEFAULTS, FC, PropList, type t } from './common';
import { Field } from './field';

/**
 * Component
 */
const View: React.FC<t.InfoProps> = (props) => {
  const { data = {} } = props;
  const fields = PropList.fields(props.fields, DEFAULTS.fields.default);

  const items = PropList.builder<t.InfoField>()
    .field('Module', () => Field.module())
    .field('Module.Verify', () => Field.moduleVerify())
    .field('Component', () => Field.component(data.component))
    .items(fields);

  return (
    <PropList
      title={PropList.Info.title(props)}
      items={items}
      width={PropList.Info.width(props)}
      defaults={{ clipboard: false }}
      margin={props.margin}
      style={props.style}
    />
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULTS: typeof DEFAULTS;
};
export const Info = FC.decorate<t.InfoProps, Fields>(
  View,
  { DEFAULTS },
  { displayName: DEFAULTS.displayName },
);
