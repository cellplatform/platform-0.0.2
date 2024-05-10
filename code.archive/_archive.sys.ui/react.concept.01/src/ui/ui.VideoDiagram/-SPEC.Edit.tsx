import {
  COLORS,
  Color,
  Concept,
  Dev,
  Is,
  TestFile,
  Time,
  Video,
  Wrangle,
  css,
  rx,
  type t,
} from '../../test.ui';
import { DevFile } from '../ui.Index/-DEV.File';
import { DevSelected } from '../ui.Index/-DEV.Selected';
import { YamlTextArea } from './-DEV.Edit.Yaml';

type T = {
  status?: t.VideoStatus;
  index: t.IndexProps;
  diagram: t.VideoDiagramProps;
  debug: { playbarEnabled?: boolean };
};
const initial: T = {
  index: {},
  diagram: {},
  debug: {},
};

/**
 * Spec
 */
const name = 'VideoDiagram (Edit)';

export default Dev.describe(name, async (e) => {
  const { dispose, dispose$ } = rx.disposable();

  type LocalStore = Pick<t.IndexProps, 'selected'> & Pick<t.VideoDiagramProps, 'muted' | 'debug'>;
  const localstore = Dev.LocalStorage<LocalStore>('dev:sys.ui.concept.VideoDiagram.Edit');
  const local = localstore.object({
    selected: undefined,
    muted: false,
    debug: false,
  });

  /**
   * (CRDT) Filesystem
   */
  const { dir, fs, doc, file } = await TestFile.init({ dispose$ });

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);

    const state = await ctx.state<T>(initial);
    const Selected = DevSelected(doc, () => state.current.index.selected);

    await state.change((d) => {
      d.index.items = doc.current.slugs;
      d.index.selected = local.selected;
      d.index.focused = true;
      d.diagram.debug = local.debug;
      d.diagram.muted = local.muted;
      d.debug.playbarEnabled = true;
    });

    const onSelectionChanged = async () => {
      await state.change((d) => {
        const slug = Selected.slug.item;
        if (Is.slug(slug)) {
          d.diagram.split = slug.split;
          d.diagram.video = slug.video;
        }
      });
    };

    await onSelectionChanged();
    localstore.changed$.subscribe((e) => {
      if (e.kind === 'put' && e.key === 'selected') {
        Time.delay(0, onSelectionChanged);
      }
    });

    doc.$.subscribe((e) => {
      const slug = e.doc.slugs[Selected.index];
      if (Is.slug(slug)) {
        state.change((d) => {
          d.diagram.split = slug.split;
          d.diagram.video = slug.video;
        });
      }
    });

    ctx.debug.width(330);
    ctx.subject
      .size('fill')
      .display('grid')
      .render<T>((e) => {
        const slug = Selected.slug.item;

        const styles = {
          base: css({ display: 'grid', gridTemplateColumns: 'auto 1fr' }),
          left: css({
            width: 265,
            position: 'relative',
            display: 'grid',
            borderRight: `solid 1px ${Color.alpha(COLORS.DARK, 0.06)}`,
          }),
          right: css({
            position: 'relative',
            display: 'grid',
            backgroundColor: COLORS.WHITE,
          }),
          id: css({
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: 600,
            Absolute: [-20, 8, null, null],
            opacity: 0.3,
          }),
        };

        const elSlugId = slug && <div {...styles.id}>{`slug:${slug.id}`}</div>;

        return (
          <div {...styles.base}>
            <div {...styles.left}>
              <Concept.Index
                {...e.state.index}
                padding={10}
                onSelect={(e) => state.change((d) => (local.selected = d.index.selected = e.index))}
              />
            </div>
            <div {...styles.right}>
              <Concept.VideoDiagram
                {...e.state.diagram}
                onVideoStatus={(e) => state.change((d) => (d.status = e.status))}
              />
              {elSlugId}
            </div>
          </div>
        );
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();
    const Selected = DevSelected(doc, () => state.current.index.selected);

    dev.header
      .padding(15)
      .border(-0.1)
      .render<T>((e) => {
        const slug = Selected.slug.item;
        const status = e.state.status;
        const ticks = Wrangle.ticks(slug?.video, status);
        return (
          <Video.PlayBar
            enabled={e.state.debug.playbarEnabled ?? true}
            size={'Small'}
            status={status}
            progress={{ ticks }}
            useKeyboard={true}
            onSeek={(e) => state.change((d) => (d.diagram.timestamp = e.seconds))}
            onMute={(e) => state.change((d) => (local.muted = d.diagram.muted = e.muted))}
            onPlayAction={(e) => {
              state.change((d) => {
                d.diagram.playing = e.is.playing;
                if (e.replay) d.diagram.timestamp = 0;
              });
            }}
          />
        );
      });

    dev.section('Properties', (dev) => {
      dev.hr(0, 3);
      dev.row((e) => {
        return (
          <Concept.VideoDiagram.Props.Split
            props={e.state.diagram}
            onChange={(e) => {
              doc.change((d) => {
                const slug = d.slugs[Selected.index];
                if (Is.slug(slug)) slug.split = e.split;
              });
            }}
          />
        );
      });

      dev.hr(0, 5);
    });

    dev.section(/* Video Settings */ '', (dev) => {
      dev.textbox((txt) => {
        const value = () => Selected.slug.item?.video?.src?.ref ?? '';
        txt
          .label((e) => 'video')
          .placeholder('video source id')
          .value((e) => value())
          .onChange((e) => {
            doc.change((d) => {
              const slug = d.slugs[Selected.index];
              if (Is.slug(slug)) {
                const video = slug.video ?? (slug.video = {});
                video.src = Video.src(e.to.value);
              }
            });
          });
      });

      dev.hr(0, 5);

      dev.textbox((txt) => {
        const value = () => String(Selected.slug.item?.video?.innerScale ?? 1);
        txt
          .label((e) => 'inner scale')
          .placeholder('1')
          .value((e) => value())
          .onChange((e) => {
            doc.change((d) => {
              const slug = d.slugs[Selected.index];
              if (Is.slug(slug)) {
                const video = slug.video ?? (slug.video = {});
                const innerScale = Number(e.to.value);
                if (!isNaN(innerScale)) video.innerScale = innerScale;
              }
            });
          });
      });

      dev.hr(0, 10);

      dev.row((e) => {
        const images = Selected.slug.item?.video?.timestamps;
        return (
          <YamlTextArea
            images={images}
            onFocus={(e) => state.change((d) => (d.debug.playbarEnabled = !e.focused))}
            onEnter={(e) => {
              doc.change((d) => {
                const slug = d.slugs[Selected.index];
                if (Is.slug(slug)) {
                  const video = slug.video ?? (slug.video = {});
                  video.timestamps = e.images;
                }
              });
            }}
          />
        );
      });
    });

    dev.hr(0, 30);

    dev.section('Debug', async (dev) => {
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.diagram.debug);
        btn
          .label((e) => `debug`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.debug = Dev.toggle(d.diagram, 'debug'))));
      });

      dev.hr(5, 20);

      await DevFile(dev, fs, file, dir);
      dev.hr(0, 50);
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.footer.border(-0.1).render<T>((e) => {
      const data = {
        'props:index': e.state.index,
        'props:diagram': e.state.diagram,
        doc: doc.current,
      };
      return <Dev.Object name={name} data={data} expand={1} />;
    });
  });
});
