import { VideoPlayer } from '..';
import { Dev, Icons, ProgressBar, type t } from '../../../test.ui';
import { SAMPLE } from './-Sample.mjs';
import { PlayBar } from '../../ui.PlayBar';

const DEFAULTS = VideoPlayer.DEFAULTS;

type T = {
  props: t.VideoPlayerProps;
  debug: { devWidth?: number };
  status?: t.VideoStatus;
};
const initial: T = {
  props: {},
  debug: {},
};

/**
 * Vime Docs:
 * https://vimejs.com/
 */
export default Dev.describe('Player (Vime)', (e) => {
  type LocalStore = Pick<T['debug'], 'devWidth'> &
    Pick<t.VideoPlayerProps, 'video' | 'playing' | 'loop' | 'borderRadius' | 'muted' | 'enabled'>;
  const localstore = Dev.LocalStorage<LocalStore>('dev:ext.ui.react.vime.Player');
  const local = localstore.object({
    devWidth: 500,
    video: SAMPLE.VIMEO.Tubes,
    playing: DEFAULTS.playing,
    loop: DEFAULTS.loop,
    muted: DEFAULTS.muted,
    enabled: DEFAULTS.enabled,
    borderRadius: DEFAULTS.borderRadius,
  });

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);

    const state = await ctx.state<T>(initial);
    await state.change((d) => {
      d.props.playing = local.playing;
      d.props.loop = local.loop;
      d.props.video = local.video;
      d.props.borderRadius = local.borderRadius;
      d.props.muted = local.muted;
      d.props.enabled = local.enabled;
      d.debug.devWidth = local.devWidth;
    });

    ctx.debug.width(330);
    ctx.subject.display('grid').render<T>((e) => {
      const { debug, props } = e.state;
      ctx.subject.size([debug.devWidth, null]);
      return (
        <VideoPlayer
          {...props}
          onChange={(e) => {
            /**
             * Update host state: → "status"
             */
            state.change((d) => (d.status = e.status));
          }}
        />
      );
    });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const ctx = dev.ctx;
    const state = await dev.state();

    dev.section('Properties', (dev) => {
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.enabled);
        btn
          .label((e) => 'enabled')
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.enabled = Dev.toggle(d.props, 'enabled'))));
      });

      dev.hr(-1, 5);

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.playing);
        btn
          .label((e) => (value(e.state) ? 'playing' : 'paused'))
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.playing = Dev.toggle(d.props, 'playing'))));
      });

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.loop);
        btn
          .label((e) => `loop`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.loop = Dev.toggle(d.props, 'loop'))));
      });

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.muted);
        btn
          .label((e) => `muted`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.muted = Dev.toggle(d.props, 'muted'))));
      });

      dev.hr(-1, 5);

      dev.boolean((btn) => {
        const value = (state: T) => state.props.borderRadius ?? 0;
        btn
          .label((e) => `borderRadius: ${value(e.state)}px`)
          .value((e) => value(e.state) > 0)
          .onClick(async (e) => {
            await e.change((d) => (d.props.borderRadius = value(d) > 0 ? 0 : 10));
            local.borderRadius = state.current.props.borderRadius;
          });
      });
    });

    dev.row((e) => {
      return (
        <PlayBar
          style={{ marginTop: 15, marginBottom: 15 }}
          status={e.state.status}
          useKeyboard={true}
          onSeek={(e) => state.change((d) => (d.props.timestamp = e.seconds))}
          onPlayAction={(e) => {
            state.change((d) => {
              d.props.playing = e.is.playing;
              if (e.replay) d.props.timestamp = 0;
            });
          }}
        />
      );
    });

    dev.section(['Video', '(Source)'], (dev) => {
      const def = (def: t.VideoSrc, hint?: string) => {
        const isCurrent = () => def.id === state.current.props.video?.id;

        const id = def.id ? `${def.id.substring(0, 4)}...` : '(empty)';
        let label = `${def.kind}: “${id}” ${hint ? `(${hint})` : ''}`;

        dev.button((btn) => {
          btn
            .label(label)
            .right((e) => isCurrent() && `←`)
            .onClick((e) => e.change((d) => (local.video = d.props.video = def)));
        });
      };

      def(SAMPLE.VIMEO.Tubes, 'Tubes');
      def(SAMPLE.VIMEO.Running, 'Running');
      dev.hr(-1, 5);
      def(SAMPLE.YOUTUBE.AlanKay, 'Alan Kay');
      dev.hr(-1, 5);
      def(DEFAULTS.unknown);
    });

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      const width = (width: number) => {
        dev.button((btn) => {
          btn
            .label(`resize → width: ${width}px`)
            .right((e) => (e.state.debug.devWidth === width ? <Icons.Photo size={18} /> : ''))
            .onClick((e) => e.change((d) => (local.devWidth = d.debug.devWidth = width)));
        });
      };

      width(500);
      width(300);
    });

    dev.hr(5, 20);

    dev.section('Timestamp', (dev) => {
      const timestamp = (secs?: t.Seconds, label?: string) => {
        const value = (state: T) => state.props.timestamp;
        dev.button((btn) => {
          btn
            .label(label ?? `${secs} seconds`)
            .right((e) => (value(e.state) === secs ? `←` : ''))
            .onClick((e) => e.change((d) => (d.props.timestamp = secs)));
        });
      };

      timestamp(undefined, '(undefined)');
      timestamp(0);
      timestamp(10);

      dev.row((e) => {
        const { status } = e.state;
        return (
          <ProgressBar
            style={{ MarginX: 0 }}
            percent={status?.percent.complete}
            buffered={status?.percent.buffered}
            onClick={(e) => {
              console.info('⚡️ progress → click', e);
              state.change((d) => {
                d.props.timestamp = e.timestamp(d.status?.secs.total);
              });
            }}
          />
        );
      });
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.footer.border(-0.1).render<T>((e) => {
      const { props, status } = e.state;
      const data = { props, status };
      return (
        <Dev.Object
          name={'VideoPlayer'}
          data={data}
          expand={{ level: 1, paths: ['$', '$.status', '$.status.secs', '$.status.is'] }}
        />
      );
    });
  });
});
