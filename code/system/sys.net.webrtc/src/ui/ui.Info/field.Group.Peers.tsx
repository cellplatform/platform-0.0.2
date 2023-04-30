import { Value, t, PropList } from './common';
import { Chip } from './ui.Chip';
import { Video } from './ui.Video';

export function FieldGroupList(
  fields: t.WebRtcInfoField[],
  data: t.WebRtcInfoData,
  info?: t.WebRtcInfo,
): t.PropListItem[] {
  const peer = info?.peer;
  const indent = 15;

  if (!peer || peer.connections.length === 0) {
    return [];
  }

  return peer.connectionsByPeer.map((e) => {
    const shortid = Value.shortenHash(e.peer.remote, [0, 5]);
    const camera = e.media.find((conn) => conn.metadata.input === 'camera');
    const stream = camera?.stream.remote;

    const item: t.PropListItem = {
      label: <Video stream={stream} />,
      value: <Chip text={`id:${shortid}`} />,
      indent,
    };
    return item;
  });
}
