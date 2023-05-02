import { t, Value, PropList } from '../common';

export function FieldSelf(
  fields: t.WebRtcInfoField[],
  data: t.WebRtcInfoData,
  info?: t.WebRtcInfo,
): t.PropListItem {
  const self = data.self;
  const label = self?.title ?? 'Me';
  const peer = info?.peer;

  if (!peer) {
    return {
      label,
      value: { data: '(not specified)', opacity: 0.3 },
    };
  }

  const shorthash = Value.shortenHash(peer.id, [5, 0]);
  const item: t.PropListItem = {
    label,
    tooltip: `Peer ID: ${peer.id}`,
    value: {
      data: <PropList.Chip text={`me:${shorthash}`} />,
      clipboard: peer.id,
    },
  };

  return item;
}
