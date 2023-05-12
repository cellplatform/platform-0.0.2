import { useState } from 'react';

import { DEFAULTS, FC, FIELDS, Pkg, PropList, t } from './common';
import { FieldGroup } from './fields/Group';
import { FieldGroupList as FieldGroupPeers } from './fields/Group.Peers';
import { FieldModuleVerify } from './fields/Module.Verify';
import { FieldPeer } from './fields/Peer';
import { FieldPeerConnections } from './fields/Peer.Connections';
import { FieldSelf } from './fields/Self';
import { FieldStateShared } from './fields/State.Shared';
import { useInfo } from './useInfo.mjs';

export type WebRtcInfoProps = {
  events?: t.WebRtcEvents;
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
  const { events, fields = DEFAULTS.fields, data = {} } = props;

  const info = useInfo(events);

  const [isOver, setOver] = useState(false);
  const over = (isOver: boolean) => () => setOver(isOver);

  const items = PropList.builder<t.WebRtcInfoField>()
    .field('Module', { label: 'Module', value: `${Pkg.name}@${Pkg.version}` })
    .field('Module.Verify', () => FieldModuleVerify(fields, data))
    .field('Self.Id', () => FieldSelf(fields, data, info))
    .field('Group', () => FieldGroup(fields, data, info))
    .field('Group.Peers', () => FieldGroupPeers({ fields, data, info, events, isOver }))
    .field('State.Shared', () => FieldStateShared(fields, data, info))
    .field('Peer', () => FieldPeer(fields, data, info))
    .field('Peer.Connections', () => FieldPeerConnections(fields, data, info))
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
      onMouseEnter={over(true)}
      onMouseLeave={over(false)}
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
