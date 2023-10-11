import { Icons, LabelItem, PeerUri, type t } from './common';
import { Data } from './Model.Data';
import { PeerLabel } from './ui.PeerLabel';

export function renderers(args: { ctx: t.GetConnectorCtx }): t.ConnectorItemRenderers {
  return {
    label(e) {
      const data = Data.remote(e.item);
      const uri = PeerUri.uri(data.peerid);
      return <PeerLabel uri={uri} />;
    },

    placeholder(e) {
      const data = Data.remote(e.item);
      const err = data.error?.type;
      let text = e.item.placeholder;

      if (err === 'InvalidPeer') text = 'invalid peer ( please try again )';
      if (err === 'PeerIsSelf') text = 'cannot connect to yourself';
      return <>{text}</>;
    },

    action(kind, helpers) {
      if (kind === 'remote:left') {
        return (e) => <Icons.Add {...helpers.icon(e, 17)} />;
      }

      if (kind === 'remote:right') {
        return (e) => {
          const data = Data.remote(e.item);

          if (data.error) {
            return (
              <Icons.Warning {...helpers.icon(e, 18)} tooltip={'Error'} margin={[0, 2, 0, 0]} />
            );
          }

          /**
           * TODO 🐷
           */
          if (e.selected && data.peerid) {
            const spinning = false;
            return (
              <LabelItem.Button selected={e.selected} focused={e.focused} spinning={spinning} />
            );
          }

          return null;
        };
      }

      return;
    },
  };
}
