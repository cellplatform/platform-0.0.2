import { t, Value } from './common';
import { Chip } from './ui.Chip';

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

  const item: t.PropListItem = {
    label,
    tooltip: `Peer ID: ${peer.id}`,
    value: {
      data: <Chip text={`me:${Value.shortenHash(peer.id, [0, 5])}`} />,
      clipboard: peer.id,
    },
  };

  return item;
}
