import { TestFile, Color, COLORS, Concept, Dev, css, type t, rx } from '../../test.ui';

type T = {
  index: t.IndexProps;
  diagram: t.VideoDiagramProps;
};
const initial: T = {
  index: {},
  diagram: {},
};

/**
 * Spec
 */
const name = 'VideoDiagram (Edit)';

export default Dev.describe(name, async (e) => {
  const { dispose, dispose$ } = rx.disposable();

  type LocalStore = Pick<t.IndexProps, 'selected'>;
  const localstore = Dev.LocalStorage<LocalStore>('dev:sys.ui.concept.VideoDiagram.Edit');
  const local = localstore.object({
    selected: undefined,
  });

  /**
   * (CRDT) Filesystem
   */
  const { dir, fs, doc, file } = await TestFile.init({ dispose$ });

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);

    const state = await ctx.state<T>(initial);
    await state.change((d) => {
      d.index.items = doc.current.slugs;
      d.index.selected = local.selected;
      d.index.focused = true;
    });

    ctx.debug.width(330);
    ctx.subject
      .size('fill')
      .display('grid')
      .render<T>((e) => {
        const styles = {
          base: css({
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
          }),
          left: css({
            width: 300,
            display: 'grid',
            borderRight: `solid 1px ${Color.alpha(COLORS.DARK, 0.06)}`,
          }),
          right: css({
            display: 'grid',
            backgroundColor: COLORS.WHITE,
          }),
        };
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
              <Concept.VideoDiagram {...e.state.diagram} />
            </div>
          </div>
        );
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.section('Properties', (dev) => {
      dev.hr(0, 3);
      dev.row((e) => {
        return (
          <Concept.VideoDiagram.Props.Split
            props={e.state.diagram}
            onChange={(e) => {
              /**
               * TODO 🐷 update selected
               */
              // state.change((d) => (d.props.split = e.split));
              console.log('change slit', e);
            }}
          />
        );
      });

      dev.hr(0, 10);

      dev.row((e) => {
        return (
          <Concept.VideoDiagram.Props.ImageScale
            props={e.state.diagram}
            onChange={(e) => {
              //
              //
              /**
               * TODO 🐷
               */
              console.log('change image scale', e);
            }}
            // onChange={(e) => state.change((d) => (State.image(d).scale = e.percent * 2))}
          />
        );
      });
    });

    dev.hr(5, 20);

    //
    // });
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
