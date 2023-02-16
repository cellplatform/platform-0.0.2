import { WebRTC } from '.';
import {
  Color,
  COLORS,
  css,
  Dev,
  MediaStream,
  PeerList,
  PeerVideo,
  rx,
  slug,
  t,
  TEST,
  TextInput,
} from '../test.ui';
import { DevCrdtSync } from './-dev/DEV.CrdtSync';

type T = {
  self?: t.Peer;
  main: { media?: MediaStream };
  debug: {
    remotePeer?: t.PeerId;
    testrunner: { spinning?: boolean; data?: t.TestSuiteRunResponse };
    muted: boolean;
  };
};
const initial: T = {
  self: undefined,
  main: {},
  debug: {
    remotePeer: '',
    muted: location.hostname === 'localhost',
    testrunner: {},
  },
};

const CODE = `
/**
 * system.network.webrtc
 * 
 * Peer-to-peer network tooling
 * (realtime network streams: data/video/audio).
 * 
 * Runtime:  browser
 * Standard: https://www.w3.org/TR/webrtc/
 * 
 * Concepts: 
 *  - Distributed EventBus
 *  - Stream types: Data/Media
 */
`.substring(1);

export default Dev.describe('WebRTC', (e) => {
  type LocalStore = { muted: boolean };
  const local = Dev.LocalStorage<LocalStore>('dev:sys.net.webrtc').object({ muted: true });
  const signal = TEST.signal;
  let self: t.Peer;

  const bus = rx.bus();
  const media = WebRTC.Media.singleton({ bus });
  const streamRef = `sample.${slug()}`;

  e.it('init:webrtc', async (e) => {
    const ctx = Dev.ctx(e);
    const state = await ctx.state<T>(initial);
    await state.change((d) => (d.debug.muted = local.muted));

    const { getStream } = media;

    /**
     * WebRTC (network).
     */
    self = await WebRTC.peer({ signal, getStream });
    await state.change((d) => (d.self = self));
    self.connections$.subscribe((e) => {
      state.change((d) => (d.self = self));
    });
  });

  e.it('init:ui', async (e) => {
    const ctx = Dev.ctx(e);
    ctx.subject
      .display('grid')
      .backgroundColor(1)
      .backgroundColor(1)
      .size('fill')
      .render<T>(async (e) => {
        const { MonacoEditor } = await import('sys.ui.react.monaco');
        const styles = {
          base: css({
            display: 'grid',
            gridTemplateRows: '1fr 1fr 2fr',
          }),
          main: css({ position: 'relative' }),
          footer: css({ borderTop: `solid 1px ${Color.format(-0.2)}`, display: 'grid' }),
          media: css({ Absolute: 0 }),
        };

        const media = e.state.main.media;

        const elRunner = !media && (
          <Dev.TestRunner.Results
            {...e.state.debug.testrunner}
            padding={10}
            scroll={true}
            style={{ Absolute: 0 }}
          />
        );

        const elMedia = media && <MediaStream.Video stream={media} style={styles.media} />;

        return (
          <div {...styles.base}>
            <div {...styles.main}>
              {elRunner}
              {elMedia}
            </div>
            <DevCrdtSync self={self} />
            <div {...styles.footer}>
              <MonacoEditor language={'typescript'} text={CODE} />
            </div>
          </div>
        );
      });
  });

  e.it('debug panel', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.ctx.state<T>(initial);

    dev.header
      .padding(0)
      .border(-0.1)
      .render<T>((e) => {
        return (
          <PeerVideo
            self={self}
            mediaHeight={250}
            muted={e.state.debug.muted}
            onMuteClick={() => {
              state.change((d) => {
                const next = !d.debug.muted;
                d.debug.muted = next;
                local.muted = next;
              });
            }}
          />
        );
      });

    dev.footer.border(-0.1).render<T>((e) => {
      const { self } = e.state;
      const connections = self?.connections;
      const media = {
        '🐷[1]': `refactor bus/events in source module: sys.ui.video`,
      }; // TODO 🐷
      const data = {
        length: connections?.length ?? 0,
        Peer: { self, connections },
        MediaStream__TODO__REFACTOR__: media,
      };
      return <Dev.Object name={'WebRTC'} data={data} expand={1} />;
    });

    dev.section((dev) => {
      dev.row((e) => {
        return (
          <TextInput
            value={e.state.debug.remotePeer}
            valueStyle={{ fontSize: 14 }}
            placeholder={'paste remote peer'}
            placeholderStyle={{ opacity: 0.3, italic: true }}
            focusAction={'Select'}
            spellCheck={false}
            onChanged={(e) => dev.change((d) => (d.debug.remotePeer = e.to))}
            onEnter={async () => {
              const id = state.current.debug.remotePeer;
              connectData(id);
              connectCamera(id);
            }}
          />
        );
      });
      dev.hr();

      const isSelf = (state: T) => {
        const remote = WebRTC.Util.asId(state.debug.remotePeer ?? '');
        return remote === self.id;
      };

      const canConnect = (state: T) => {
        const remote = state.debug.remotePeer ?? '';
        return Boolean(remote) && !isSelf(state);
      };

      const connectData = async (remote: t.PeerId = '') => {
        const conn = await self.data(remote);
        console.log('⚡️ peer.data (response):', conn);
        return conn;
      };

      const connectCamera = async (remote: t.PeerId = '') => {
        const conn = await self.media(remote, 'camera');
        console.log('⚡️ peer.media:camera (response):', conn);
        return conn;
      };

      const connectScreenshare = async (remote: t.PeerId = '') => {
        /**
         * TODO 🐷 - connect screen share
         * - [ ] recieve event notification from Peer display list (UI)
         */
        const conn = await self.media(remote, 'screen');
        console.log('⚡️ peer.media:screen (response):', conn);
        return conn;
      };

      dev.row((e) => {
        const totalPeers = self.connectionsByPeer.length;
        if (totalPeers === 0) return;

        const styles = {
          base: css({
            position: 'relative',
            marginTop: 10,
          }),
          list: css({ marginLeft: 20, marginRight: 10 }),
          hrBottom: css({
            borderBottom: `solid 5px ${Color.alpha(COLORS.DARK, 0.1)}`,
            marginTop: 30,
            marginBottom: 20,
          }),
        };

        const showConnection = (id: t.PeerConnectionId) => {
          const conn = self.connections.media.find((item) => item.id === id);
          const stream = conn?.stream.remote || conn?.stream.local;
          state.change((d) => (d.main.media = stream));
        };

        return (
          <div {...styles.base}>
            <PeerList
              self={self}
              style={styles.list}
              onConnectRequest={async (ev) => {
                const peerid = state.current.debug.remotePeer;
                if (ev.kind === 'data') await connectData(peerid);
                if (ev.kind === 'media:camera') await connectCamera(peerid);
                if (ev.kind === 'media:screen') {
                  const conn = await connectScreenshare(peerid);
                  console.log('conn', conn);
                  showConnection(conn.id);
                }
              }}
              onDisplayConnRequest={(ev) => {
                showConnection(ev.connection);
              }}
            />
            <div {...styles.hrBottom} />
          </div>
        );
      });

      dev.section((dev) => {
        const connectButton = (label: string, fn: t.DevButtonClickHandler<T>) => {
          dev.button((btn) =>
            btn
              .label(`(debug) connect: ${label}`)
              .right((e) => (isSelf(e.state) ? 'self ⚠️' : ''))
              .enabled((e) => canConnect(e.state))
              .onClick(fn),
          );
        };

        dev.button((btn) =>
          btn
            .label('close all')
            // .enabled((e) => Boolean(e.state.connections.length > 0))
            .onClick(async (e) => {
              self.connections.all.forEach((conn) => conn.dispose());
              await media.events.stop(streamRef).fire();
            }),
        );
        dev.hr();
        connectButton('data', (e) => connectData(e.state.current.debug.remotePeer));
        connectButton('camera', (e) => connectCamera(e.state.current.debug.remotePeer));
        connectButton('screen', (e) => connectScreenshare(e.state.current.debug.remotePeer));
      });

      dev.hr();
    });

    dev.section('Integrity', (dev) => {
      const invoke = async (module: t.SpecImport) => {
        await dev.change((d) => {
          d.debug.testrunner.spinning = true;
          d.main.media = undefined;
        });
        const spec = (await module).default;
        const results = await spec.run();
        await dev.change((d) => {
          d.debug.testrunner.data = results;
          d.debug.testrunner.spinning = false;
        });
      };

      const button = (label: string, module: t.SpecImport) => {
        dev.button(`run: ${label}`, () => invoke(module));
      };

      button('MediaStream tests', import('../WebRTC.Media/Media-TEST.mjs'));
      button('WebRTC tests', import('./-dev/TEST.peer.mjs'));
      button('PeerSyncer (CRDT) tests', import('./-dev/TEST.PeerSyncer.mjs'));
    });

    dev.hr();

    dev.section((dev) => {
      dev.row(async (e) => {
        const { QRCode } = await import('sys.ui.react.common');

        const peerId = self.id;
        const value = WebRTC.Util.asUri(peerId);

        const styles = {
          base: css({
            marginTop: 20,
            display: 'grid',
            placeItems: 'center',
          }),
        };
        return (
          <div {...styles.base}>
            <QRCode value={value} size={180} />
          </div>
        );
      });
    });
  });
});
