import { Dev, TestNetwork, WebRtc, t } from '../../../test.ui';
import { PeerRow, PeerRowProps } from '../ui.PeerRow';

type T = {
  props: PeerRowProps;
  debug: { useNetwork: 'Local' | 'Remote' };
};
const initial: T = {
  props: { peerid: 'p-foo' },
  debug: { useNetwork: 'Local' },
};

export default Dev.describe('PeerRow', async (e) => {
  type LocalStore = T['debug'] & { isSelected: boolean; isSelf: boolean; useController: boolean };
  const localstore = Dev.LocalStorage<LocalStore>('dev:sys.net.webrtc.PeerRow');
  const local = localstore.object({
    isSelected: true,
    isSelf: true,
    useNetwork: 'Local',
    useController: true,
  });

  const create = async () => {
    const peer = await TestNetwork.peer();
    const controller = WebRtc.controller(peer);
    return { peer, controller };
  };

  const [self, remote] = await Promise.all([create(), create()]);

  // const networkPeer = (args: { peer: t.Peer; controller: t.WebRtcController }) => {
  //   const { peer, controller } = args;
  //   const network = controller.state.current.network;
  //   return network.peers[peer.id];
  // };

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const state = await ctx.state<T>(initial);

    state.change((d) => {
      d.props.isSelected = local.isSelected;
      d.props.isSelf = local.isSelf;
      d.props.useController = local.useController;
      d.debug.useNetwork = local.useNetwork;
    });

    ctx.subject
      .backgroundColor(1)
      .size([250, null])
      .display('grid')
      .render<T>((e) => {
        return (
          <PeerRow
            {...e.state.props}
            onSelect={(e) => console.info('⚡️ onSelect:', e)}
            onControlClick={(e) => console.info('⚡️ onControlClick:', e)}
          />
        );
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);

    dev.section('Properties', (dev) => {
      dev.boolean((btn) =>
        btn
          .label((e) => 'useController')
          .value((e) => Boolean(e.state.props.useController))
          .onClick((e) =>
            e.change((d) => (local.useController = Dev.toggle(d.props, 'useController'))),
          ),
      );
      dev.hr(-1, 5);
      dev.boolean((btn) =>
        btn
          .label((e) => 'isSelected')
          .value((e) => Boolean(e.state.props.isSelected))
          .onClick((e) => e.change((d) => (local.isSelected = Dev.toggle(d.props, 'isSelected')))),
      );
      dev.boolean((btn) =>
        btn
          .label((e) => 'isSelf')
          .value((e) => Boolean(e.state.props.isSelf))
          .onClick((e) => e.change((d) => (local.isSelf = Dev.toggle(d.props, 'isSelf')))),
      );
    });

    dev.hr(5, 20);
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev.footer.border(-0.1).render<T>((e) => {
      const total = (peer: t.Peer) => peer.connectionsByPeer.length ?? 0;
      const data = {
        [`Peer:Self(${total(self.peer)})`]: self,
        [`Peer:Remote(${total(remote.peer)})`]: remote,
        props: e.state.props,
      };

      return <Dev.Object name={'PeerRow'} data={data} expand={1} />;
    });
  });
});
