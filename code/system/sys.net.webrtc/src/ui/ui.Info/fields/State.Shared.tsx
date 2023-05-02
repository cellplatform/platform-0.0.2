import { t, Value, Icons, COLORS, Color, Crdt, css, Filesize } from '../common';
import { useSyncTraffic } from '../useSyncTraffic.mjs';

export function FieldStateShared(
  fields: t.WebRtcInfoField[],
  data: t.WebRtcInfoData,
  info?: t.WebRtcInfo,
): t.PropListItem {
  const shared = data.state?.shared ?? {};
  const label = shared.title ?? 'Shared State';

  const clipboard = () => {
    //
    const doc = info?.state.current;
    const data = doc ? Crdt.toObject(doc.network) : undefined;
    console.info('shared/state.network', data);
    return JSON.stringify(data, null, '  ');
  };

  return {
    label,
    value: {
      data: <Syncers info={info} />,

      // clipboard: () => {
      // const doc = info?.state.current;
      // const data = doc ? Crdt.toObject(doc.network) : undefined;
      // console.info('shared/state.network', data);
      // return JSON.stringify(data, null, '  ');
      // },

      // ocl(e) {},
      // onClick(e) {
      //   const doc = info?.state.current;
      //   const data = doc ? Crdt.toObject(doc.network) : undefined;
      //   console.info('shared/state.network', data);
      // },
    },
  };
}

/**
 * Component
 */
export type SyncProps = {
  info?: t.WebRtcInfo;
  style?: t.CssValue;
};

export const Syncers: React.FC<SyncProps> = (props) => {
  const { syncers, bytes, messages } = useSyncTraffic(props.info);

  const isEmpty = syncers.length === 0;
  const size = Filesize(bytes, { round: 0 });
  const msg = {
    total: messages.toLocaleString(),
    messages: Value.plural(messages, 'message', 'messages'),
  };
  const text = `${msg.total} ${msg.messages}, ${size}`;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    empty: css({ opacity: 0.3 }),
    icoDoc: css({ position: 'relative', top: -1, marginLeft: 6 }),
    icoNet: css({ marginRight: 4 }),
    body: css({
      display: 'grid',
      alignContent: 'center',
      gridTemplateColumns: '1fr auto auto auto',
      // columnGap: 4,
    }),
  };

  const iconColor = Color.alpha(COLORS.DARK, 0.8);
  const Icon = Icons.Network;
  const elIcoDoc = <Icon.Docs size={15} color={iconColor} style={styles.icoDoc} />;
  const elIcoNet = <Icon.Antenna size={14} color={iconColor} style={styles.icoNet} />;

  const elEmpty = isEmpty && <div {...styles.empty}>{elIcoDoc}</div>;

  const elBody = !isEmpty && (
    <div {...styles.body}>
      <div />
      {elIcoNet}
      <div>{text}</div>
      {elIcoDoc}
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elEmpty}
      {elBody}
    </div>
  );
};
