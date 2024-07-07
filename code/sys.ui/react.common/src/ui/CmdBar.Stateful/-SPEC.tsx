import { DEFAULTS } from '.';
import { Args, COLORS, Color, Dev, Immutable, ObjectPath, Pkg, Time, css, rx } from '../../test.ui';
import { CmdBar } from '../CmdBar';
import { type t } from './common';

type P = t.CmdBarStatefulProps;
type T = {
  props: P;
  debug: { render?: boolean; useState?: boolean; prependPaths?: boolean };
  current: { isFocused?: boolean; argv?: string };
};
const initial: T = { props: {}, debug: {}, current: {} };

/**
 * Spec
 */
const name = DEFAULTS.displayName;

export default Dev.describe(name, (e) => {
  type LocalStore = T['debug'] &
    Pick<P, 'theme' | 'enabled' | 'focusOnReady' | 'useKeyboard'> &
    Pick<T['current'], 'argv'>;
  const localstore = Dev.LocalStorage<LocalStore>(`dev:${Pkg.name}.${name}`);
  const local = localstore.object({
    theme: 'Dark',
    enabled: true,
    focusOnReady: true,
    useState: true,
    useKeyboard: DEFAULTS.useKeyboard,
    prependPaths: true,
    argv: undefined,
  });

  const cmdbar = CmdBar.Ctrl.create();
  const doc = Immutable.clonerRef({});

  const getPaths = (state: T, defaults?: boolean): t.CmdBarStatefulPaths => {
    const defaultPaths = defaults ? DEFAULTS.paths : undefined; // NB: default.
    const paths = state.debug.prependPaths
      ? CmdBar.Stateful.prepend(DEFAULTS.paths, ['foo'])
      : defaultPaths;
    return paths!;
  };

  const getText = (state: T) => {
    const paths = getPaths(state, true)!;
    const text = doc ? ObjectPath.resolve<string>(doc.current, paths.text) ?? '' : '';
    return text;
  };

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);

    const state = await ctx.state<T>(initial);
    await state.change((d) => {
      d.props.theme = local.theme;
      d.props.enabled = local.enabled;
      d.props.focusOnReady = local.focusOnReady;
      d.props.useKeyboard = local.useKeyboard;
      d.debug.useState = local.useState;
      d.debug.render = true;
      d.debug.prependPaths = local.prependPaths;
      d.current.argv = local.argv;
    });

    console.log('local.argv', local.argv);

    doc.change((d) => {
      const paths = getPaths(state.current);
      ObjectPath.mutate(d, paths.text, local.argv);
    });

    doc
      .events()
      .changed$.pipe(rx.debounceTime(100))
      .subscribe(() => dev.redraw('debug'));

    ctx.debug.width(330);
    ctx.subject
      .size('fill-x')
      .display('grid')
      .render<T>((e) => {
        const { props, debug, current } = e.state;
        const paths = getPaths(state.current);
        const theme = Color.theme(props.theme);
        Dev.Theme.background(dev, theme, 1);

        if (!debug.render) return null;

        const t = (prop: string, time: t.Msecs = 50) => `${prop} ${time}ms`;
        const transition = [t('opacity'), t('border')].join(', ');
        const isFocused = current.isFocused;
        const borderColor = Color.alpha(theme.is.dark ? theme.fg : COLORS.BLUE, isFocused ? 1 : 0);
        const styles = {
          base: css({ position: 'relative' }),
          cmdbar: css({ borderTop: `solid 1px ${borderColor}`, transition }),
          label: css({
            Absolute: [-17, 5, null, null],
            fontFamily: 'monospace',
            fontSize: 10,
            opacity: isFocused ? 1 : 0.3,
            transition,
          }),
        };

        const elCmdBar = (
          <CmdBar.Stateful
            {...props}
            style={styles.cmdbar}
            cmd={cmdbar.cmd}
            state={debug.useState ? doc : undefined}
            paths={paths}
            onChange={(e) => state.change((d) => (local.argv = d.current.argv = e.to))}
            onFocusChange={(e) => state.change((d) => (d.current.isFocused = e.is.focused))}
            onReady={(e) => {
              console.info('⚡️ CmdBar.Stateful.onReady:', e);
              e.dispose$.subscribe(() => console.info('CmdBar.Stateful.onReady:dispose$ → ⚡️'));

              const { textbox, paths, dispose$ } = e;
              const syncer = CmdBar.Stateful.Sync.listen(textbox, doc, paths.text, { dispose$ });
              state.change((d) => (d.current.argv = e.text));
              syncer.onChange((e) => console.info(`syncer.onChange`, e));
            }}
          />
        );

        return (
          <div {...styles.base}>
            <div {...styles.label}>{'cmdbar'}</div>
            {elCmdBar}
          </div>
        );
      });

    /**
     * <Main> sample.
     */
    ctx.host.layer(1).render<T>((e) => {
      const { props, current } = e.state;
      return CmdBar.Dev.Main.render({
        cmdbar,
        argv: current.argv,
        theme: props.theme,
        size: [400, 200],
        topHalf: true,
        style: { marginBottom: 40 },
      });
    });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();
    const link = Dev.Link.pkg(Pkg, dev);

    dev.section('Properties', (dev) => {
      Dev.Theme.switch(dev, ['props', 'theme'], (next) => (local.theme = next));
      dev.hr(-1, 5);
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.enabled);
        btn
          .label((e) => `enabled`)
          .value((e) => value(e.state))
          .onClick((e) => {
            e.change((d) => (local.enabled = Dev.toggle(d.props, 'enabled')));
          });
      });
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.focusOnReady);
        btn
          .label((e) => `focusOnReady`)
          .value((e) => value(e.state))
          .onClick((e) => {
            e.change((d) => (local.focusOnReady = Dev.toggle(d.props, 'focusOnReady')));
          });
      });

      dev.boolean((btn) => {
        const value = (state: T) => !!state.props.useKeyboard;
        btn
          .label((e) => `useKeyboard`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => Dev.toggle(d.props, 'useKeyboard')));
      });
    });

    dev.hr(5, 20);

    dev.section(['Ctrl', 'Command'], (dev) => {
      const focus = (select?: boolean) => {
        const invoke = () => Time.delay(0, () => cmdbar.focus({ select }));
        dev.button(['cmd: Focus', select ? 'select' : ''], () => invoke());
      };
      focus(true);
      focus(false);
      dev.hr(-1, 5);
      dev.button('cmd: Invoke', (e) => {
        const text = getText(state.current);
        cmdbar.invoke({ text });
      });
      dev.hr(-1, 5);

      const keyAction = cmdbar.keyAction;
      dev.button(['CMD + J', 'focus:main'], (e) => keyAction({ name: 'Focus:Main' }));
      dev.button(['CMD + K', 'focus:cmdbar'], (e) => keyAction({ name: 'FocusAndSelect' }));
    });

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      dev.button('redraw', (e) => dev.redraw());
      dev.hr(-1, 5);

      dev.boolean((btn) => {
        const value = (state: T) => !!state.debug.render;
        btn
          .label((e) => `render`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => Dev.toggle(d.debug, 'render')));
      });

      dev.boolean((btn) => {
        const value = (state: T) => !!state.debug.useState;
        btn
          .label((e) => `state${value(e.state) ? '' : ': undefined'}`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.useState = Dev.toggle(d.debug, 'useState'))));
      });
      dev.boolean((btn) => {
        const value = (state: T) => !!state.debug.prependPaths;
        btn
          .label((e) => (value(e.state) ? `prepend paths` : `prepend paths: (default)`))
          .value((e) => value(e.state))
          .onClick((e) => {
            e.change((d) => (local.prependPaths = Dev.toggle(d.debug, 'prependPaths')));
          });
      });
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();
    dev.footer.border(-0.1).render<T>((e) => {
      const { debug, props } = e.state;


      const data = {
        props: e.state.props,
        'state( ImmutableRef<D> )': debug.useState ? doc?.current : undefined,
        text: `${text.slice(0, 20)}${text.length >= 20 ? '...' : ''}`,
        args: Args.parse(text),
      };
      return <Dev.Object name={name} data={data} expand={1} fontSize={11} />;
    });
  });
});
