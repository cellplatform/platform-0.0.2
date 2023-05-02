import { t, Value } from '../common';

export function FieldGroup(
  fields: t.WebRtcInfoField[],
  data: t.WebRtcInfoData,
  info?: t.WebRtcInfo,
): t.PropListItem {
  const peer = info?.peer;
  const label = data.group?.title ?? 'Peer Group';

  if (!peer || peer.connections.length === 0) {
    return {
      label,
      value: { data: '(empty)', opacity: 0.3 },
    };
  }

  const total = peer.connectionsByPeer.length + 1; // NB: +1 for self.
  const item: t.PropListItem = {
    label,
    value: `${total} ${Value.plural(total, 'peer', 'peers')}`,
  };

  return item;
}
