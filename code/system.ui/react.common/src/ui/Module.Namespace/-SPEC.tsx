import { DEFAULTS, ModuleNamespace } from '.';
import { COLORS, Color, Dev, Pkg, type t } from '../../test.ui';
import { WrangleSpec } from './-SPEC.wrangle';

type T = {
  props: t.ModuleNamespaceProps;
  debug: { debugBg?: boolean; debugFill?: boolean };
};
const initial: T = { props: {}, debug: {} };

const sampleImports = {
  foo: async () => null,
  bar: async () => null,
};

type K = keyof typeof sampleImports;
const renderer: t.ModuleNamespaceRenderer<K> = async (e) => {
  return null;
};

/**
 * Spec: ModuleNamespace
 */
const name = DEFAULTS.displayName;
export default Dev.describe(name, (e) => {
  type LocalStore = Pick<t.ModuleNamespaceProps, 'flipped' | 'commandbar' | 'theme'> &
    Pick<T['debug'], 'debugBg' | 'debugFill'>;

  const localstore = Dev.LocalStorage<LocalStore>(`dev:${Pkg.name}.${name}`);
  const local = localstore.object({
    flipped: false,
    commandbar: DEFAULTS.command,
    theme: DEFAULTS.theme,
    debugBg: true,
    debugFill: true,
  });

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);

    const state = await ctx.state<T>(initial);
    await state.change((d) => {
      d.props.flipped = local.flipped;
      d.props.commandbar = local.commandbar;
      d.props.theme = local.theme;
      d.props.imports = sampleImports;
      d.debug.debugBg = local.debugBg;
      d.debug.debugFill = local.debugFill;
    });

    ctx.debug.width(330);
    ctx.subject
      .size('fill', 80)
      .display('grid')
      .render<T>((e) => {
        WrangleSpec.mutateSubject(dev, e.state);
        return <ModuleNamespace {...e.state.props} render={renderer} />;
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.section('', (dev) => {
      const link = WrangleSpec.link;
      link(dev, 'see: ModuleLoader', 'Module.Loader');
      link(dev, 'see: ModuleLoader.Stateful', 'Module.Loader.Stateful');
      link(dev, 'see: ModuleNamespace.List', 'Module.Namespace.List');
    });
    dev.hr(5, 20);

    dev.TODO().hr(0, 20);

    dev.section('Properties', (dev) => {
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.flipped);
        btn
          .label((e) => `flipped`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.flipped = Dev.toggle(d.props, 'flipped'))));
      });
    });

    dev.hr(-1, 5);

    dev.boolean((btn) => {
      const value = (state: T) => Boolean(state.props.commandbar?.visible);
      btn
        .label((e) => `command.visible`)
        .value((e) => value(e.state))
        .onClick((e) =>
          e.change((d) => {
            const command = d.props.commandbar || (d.props.commandbar = DEFAULTS.command);
            Dev.toggle(command, 'visible');
            local.commandbar = command;
          }),
        );
    });

    dev.hr(-1, 5);

    const buttonTheme = (theme: t.ModuleLoaderTheme) => {
      dev.button((btn) => {
        const value = (state: T) => state.props.theme;
        const isCurrent = (state: T) => value(state) === theme;
        btn
          .label(`theme: "${theme}"`)
          .right((e) => (isCurrent(e.state) ? `←` : ''))
          .onClick((e) => e.change((d) => (local.theme = d.props.theme = theme)));
      });
    };
    buttonTheme('Light');
    buttonTheme('Dark');

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.debug.debugBg);
        btn
          .label((e) => `background: ${value(e.state) ? 'white' : '(none)'}`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.debugBg = Dev.toggle(d.debug, 'debugBg'))));
      });

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.debug.debugFill);
        btn
          .label((e) => `size: ${value(e.state) ? 'filling screen' : 'specific contraint'}`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.debugFill = Dev.toggle(d.debug, 'debugFill'))));
      });
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();
    dev.footer.border(-0.1).render<T>((e) => {
      const data = e.state;
      return <Dev.Object name={name} data={data} expand={1} />;
    });
  });
});
