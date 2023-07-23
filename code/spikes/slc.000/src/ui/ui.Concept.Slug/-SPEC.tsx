import { Dev, Icons, css, rx, slug, type t } from '../../test.ui';

import { ConceptSlug } from '.';
import { Position, Vimeo } from './common';

const DEFAULTS = ConceptSlug.DEFAULTS;

type T = {
  props: t.ConceptSlugProps;
  debug: { dummy?: boolean };
};
const initial: T = {
  props: {},
  debug: {},
};

export default Dev.describe('ConceptSlug', (e) => {
  type LocalStore = { videoPosition?: t.Pos } & Pick<T['debug'], 'dummy'>;
  const localstore = Dev.LocalStorage<LocalStore>('dev:sys.ui.ConceptSlug');
  const local = localstore.object({
    videoPosition: DEFAULTS.position,
    dummy: false,
  });

  const bus = rx.bus();
  const vimeo: t.VimeoInstance = { bus, id: `foo.${slug()}` };
  const player = Vimeo.Events(vimeo);

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);
    const state = await ctx.state<T>(initial);

    await state.change((d) => {
      const sample = DEFAULTS.sample;
      const video = {
        ...sample.video,
        position: local.videoPosition,
      };
      d.props.slug = { ...sample, video };
      d.debug.dummy = local.dummy;
    });

    ctx.debug.width(330);
    ctx.subject
      .backgroundColor(1)
      .size('fill')
      .display('grid')
      .render<T>((e) => {
        const { debug, props } = e.state;
        if (debug.dummy) return <ConceptSlug.Dummy vimeo={vimeo} />;
        return <ConceptSlug {...props} vimeo={vimeo} />;
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.row((e) => {
      return (
        <div {...css({ display: 'grid', placeItems: 'center' })}>
          <Position.Selector
            selected={e.state.props.slug?.video?.position}
            onSelect={(e) => {
              state.change((d) => {
                const id = DEFAULTS.sample.id;
                const slug = d.props.slug ?? (d.props.slug = { id });
                const video = slug.video ?? (slug.video = {});
                video.position = local.videoPosition = e.pos;
              });
            }}
          />
        </div>
      );
    });

    dev.hr(5, 20);

    dev.section('Video', (dev) => {
      dev.button((btn) => {
        btn
          .label('play')
          .right((e) => <Icons.Play.Sharp size={16} />)
          .onClick((e) => player.play.fire());
      });

      dev.button((btn) => {
        btn
          .label('pause')
          .right((e) => <Icons.Pause.Sharp size={16} />)
          .onClick((e) => player.pause.fire());
      });

      dev.hr(-1, 5);

      dev.button((btn) => {
        btn
          .label('restart')
          .right((e) => <Icons.Replay size={16} />)
          .onClick((e) => {
            player.seek.start();
            player.play.fire();
          });
      });
    });

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.debug.dummy);
        btn
          .label((e) => `dummy`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.dummy = Dev.toggle(d.debug, 'dummy'))));
      });
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();
    dev.footer.border(-0.1).render<T>((e) => {
      const data = e.state;
      return <Dev.Object name={'ConceptSlug'} data={data} expand={1} />;
    });
  });
});
