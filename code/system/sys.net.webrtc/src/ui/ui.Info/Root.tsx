import { DEFAULTS, FC, FIELDS, Pkg, PropList, t } from './common';
import { FieldModuleVerify } from './field.Module.Verify';
import { FieldGroup } from './field.Group';
import { FieldGroupList } from './field.Group.Peers';
import { FieldSelf } from './field.Self';
import { FieldStateShared } from './field.State.Shared';
import { useInfo } from './useInfo.mjs';

export type WebRtcInfoProps = {
  title?: t.PropListProps['title'];
  width?: t.PropListProps['width'];
  fields?: t.WebRtcInfoField[];
  flipped?: boolean;
  data?: t.WebRtcInfoData;
  margin?: t.CssEdgesInput;
  card?: boolean;
  style?: t.CssValue;
};

/**
 * Component
 */
const View: React.FC<WebRtcInfoProps> = (props) => {
  const { fields = DEFAULTS.fields, data = {} } = props;
  const info = useInfo(data.events);

  const items = PropList.builder<t.WebRtcInfoField>()
    .field('Module', { label: 'Module', value: `${Pkg.name}@${Pkg.version}` })
    .field('Module.Verify', () => FieldModuleVerify(fields, data))
    .field('Self.Id', () => FieldSelf(fields, data, info))
    .field('Group', () => FieldGroup(fields, data, info))
    .field('Group.Peers', () => FieldGroupList(fields, data, info))
    .field('State.Shared', () => FieldStateShared(fields, data, info))
    .items(fields);

  return (
    <PropList
      style={props.style}
      title={Wrangle.title(props)}
      items={items}
      width={props.width ?? { min: 230 }}
      defaults={{ clipboard: false }}
      card={props.card}
      flipped={props.flipped}
      padding={props.card ? [20, 25] : undefined}
      margin={props.margin}
    />
  );
};

/**
 * Helpers
 */
const Wrangle = {
  title(props: WebRtcInfoProps) {
    const title = PropList.Wrangle.title(props.title);
    if (!title.margin && props.card) title.margin = [0, 0, 15, 0];
    return title;
  },
};

/**
 * Export
 */
type Fields = {
  DEFAULTS: typeof DEFAULTS;
  FIELDS: typeof FIELDS;
};
export const WebRtcInfo = FC.decorate<WebRtcInfoProps, Fields>(
  View,
  { DEFAULTS, FIELDS },
  { displayName: 'WebRtcInfo' },
);
