import { DEFAULTS, PageStack } from '.';
import { COLORS, css, Dev, Immutable, Json, Pkg, rx, slug } from '../../test.ui';
import { type t } from './common';

type P = t.PageStackProps;
type D = { ids: string[]; start: t.Index };

const defaultDebug = (): D => {
  return {
    ids: Array.from({ length: 20 }).map(() => slug()),
    start: 0,
  };
};

/**
 * Spec
 */
const name = DEFAULTS.displayName;

export default Dev.describe(name, (e) => {
  type LocalStore = { props?: string; debug?: string };
  const localstore = Dev.LocalStorage<LocalStore>(`dev:${Pkg.name}.${name}`);
  const local = localstore.object({ props: undefined, debug: undefined });

  const State = {
    props: Immutable.clonerRef<P>(Json.parse<P>(local.props, DEFAULTS.props)),
    debug: Immutable.clonerRef<D>(Json.parse<D>(local.debug, defaultDebug)),
  } as const;

  const Props = {
    get current(): P {
      return {
        ...State.props.current,
        pages: Props.pages.current,
      };
    },
    pages: {
      get all() {
        return State.debug.current.ids;
      },
      get current() {
        const { ids, start } = State.debug.current;
        const total = DEFAULTS.total;
        return ids.slice(start, start + total);
      },
      get range() {
        const { start } = State.debug.current;
        const total = DEFAULTS.total;
        const end = start + total - 1;
        return { start, end, total } as const;
      },
      withinRange(index: t.Index) {
        const { start, end } = Props.pages.range;
        return !(index < start || index > end);
      },
    },
  } as const;

  e.it('ui:init', (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<D>(e);

    const props$ = State.props.events().changed$;
    const debug$ = State.debug.events().changed$;

    rx.merge(props$, debug$)
      .pipe(rx.debounceTime(1000))
      .subscribe(() => {
        local.props = Json.stringify(State.props.current);
        local.debug = Json.stringify(State.debug.current);
      });

    rx.merge(props$, debug$)
      .pipe(rx.debounceTime(100))
      .subscribe(() => dev.redraw());

    ctx.debug.width(330);
    ctx.subject
      .size('fill-x', 100)
      .display('grid')
      .render<D>((e) => {
        const debug = State.debug.current;
        const props = Props.current;
        Dev.Theme.background(dev, props.theme, 1);
        return <PageStack {...props} />;
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<D>(e);

    dev.section('Properties', (dev) => {
      Dev.Theme.immutable(dev, State.props, 1);
    });

    dev.hr(5, 20);

    dev.section(['Pages', 'IDs'], (dev) => {
      dev.row((e) => {
        const ids = Props.pages.all;
        const styles = {
          base: css({
            lineHeight: 1.5,
            marginLeft: 30,
            marginBottom: 20,
            display: 'grid',
            gridTemplateRows: 'repeat(5, 1fr)',
            gridAutoFlow: 'column',
          }),
          item: css({
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 600,
            opacity: 0.1,
          }),
          current: css({ opacity: 1, color: COLORS.MAGENTA }),
        };
        return (
          <div {...styles.base}>
            {ids.map((id, i) => {
              const style = Props.pages.withinRange(i) ? styles.current : undefined;
              return (
                <div key={id} {...css(styles.item, style)}>
                  {id}
                </div>
              );
            })}
          </div>
        );
      });

      const increment = (by: number) => {
        const { ids } = State.debug.current;
        const clamp = (value: t.Index) => Math.max(0, Math.min(ids.length - 1, value));
        State.debug.change((d) => (d.start = clamp(d.start + by)));
      };
      dev.button(['prev', '↑'], (e) => increment(-1));
      dev.button(['next', '↓'], (e) => increment(1));

      dev.hr(-1, 5);
      dev.button('reset', (e) => {
        State.debug.change((d) => {
          const next = defaultDebug();
          d.start = next.start;
          d.ids = next.ids;
        });
      });
    });

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      dev.button('redraw', (e) => dev.redraw());
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<D>(e);
    dev.footer.border(-0.1).render<D>((e) => {
      const data = {
        props: Props.current,
        debug: State.debug.current,
      };
      return <Dev.Object name={name} data={data} expand={1} fontSize={11} />;
    });
  });
});
