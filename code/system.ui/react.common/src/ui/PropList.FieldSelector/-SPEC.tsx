import { Dev, type t } from '../../test.ui';
import { FieldSelector } from '.';

const DEFAULTS = FieldSelector.DEFAULTS;

type T = {
  props: t.PropListFieldSelectorProps;
  debug: {};
};
const initial: T = {
  props: {},
  debug: {},
};

export default Dev.describe('PropList.FieldSelector', (e) => {
  type LocalStore = Pick<t.PropListFieldSelectorProps, 'resettable' | 'showIndexes'>;
  const localstore = Dev.LocalStorage<LocalStore>('dev:sys.ui.common.PropList.FieldSelector');
  const local = localstore.object({
    resettable: DEFAULTS.resettable,
    showIndexes: DEFAULTS.showIndexes,
  });

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const state = await ctx.state<T>(initial);
    await state.change((d) => {
      d.props.resettable = local.resettable;
      d.props.showIndexes = local.showIndexes;
    });

    ctx.subject
      .backgroundColor(1)
      .size([280, null])
      .display('grid')
      .render<T>((e) => {
        return <FieldSelector {...e.state.props} />;
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.section('Properties', (dev) => {
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.showIndexes);
        btn
          .label((e) => `showIndexes`)
          .value((e) => value(e.state))
          .onClick((e) =>
            e.change((d) => (local.showIndexes = Dev.toggle(d.props, 'showIndexes'))),
          );
      });

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.resettable);
        btn
          .label((e) => `resettable`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.resettable = Dev.toggle(d.props, 'resettable'))));
      });
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();
    dev.footer.border(-0.1).render<T>((e) => {
      const data = e.state;
      return <Dev.Object name={'PropList.FieldSelector'} data={data} expand={1} />;
    });
  });
});
