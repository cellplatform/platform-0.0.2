import { css, Dev, Pkg } from '../../test.ui';
import { Info, DEFAULTS } from './-SPEC.ui.Info';
import type * as t from './-SPEC.t';

type P = t.InfoProps;
type T = { props: P };
const initial: T = { props: {} };

/**
 * Spec
 */
const name = 'PropList.InfoCommon';

export default Dev.describe(name, (e) => {
  type LocalStore = Pick<P, 'theme' | 'fields' | 'margin'>;
  const localstore = Dev.LocalStorage<LocalStore>(`dev:${Pkg.name}.${name}`);
  const local = localstore.object({
    theme: 'Dark',
    fields: DEFAULTS.fields.default,
    margin: 10,
  });

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);

    const state = await ctx.state<T>(initial);
    await state.change((d) => {
      d.props.fields = local.fields;
      d.props.theme = local.theme;
      d.props.margin = local.margin;
    });

    ctx.debug.width(330);
    ctx.subject
      .size([250, null])
      .display('grid')
      .render<T>((e) => {
        const { props } = e.state;
        Dev.Theme.background(ctx, props.theme, 1);

        return <Info {...props} />;
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.section('Fields', (dev) => {
      const update = (fields: t.InfoField[]) => {
        dev.change((d) => (d.props.fields = fields));
        local.fields = fields?.length === 0 ? undefined : fields;
      };

      dev.row((e) => {
        const props = e.state.props;
        return (
          <Dev.FieldSelector
            all={DEFAULTS.fields.all}
            selected={props.fields}
            onClick={(ev) => {
              const fields =
                ev.action === 'Reset:Default'
                  ? DEFAULTS.fields.default
                  : (ev.next as t.InfoField[]);
              update(fields);
            }}
          />
        );
      });

      dev.hr(0, 5);

      const common = (label: string, fields: t.InfoField[]) => {
        dev.button(label, (e) => update(fields));
      };

      common('single', ['Module']);
      common('all', DEFAULTS.fields.all);
    });

    dev.hr(5, 20);

    dev.section('Properties', (dev) => {
      Dev.Theme.switch(dev, ['props', 'theme'], (next) => (local.theme = next));

      dev.boolean((btn) => {
        const value = (state: T) => state.props.margin ?? 0;
        btn
          .label((e) => `margin`)
          .value((e) => value(e.state) !== 0)
          .onClick((e) =>
            e.change((d) => {
              const current = d.props.margin ?? 0;
              local.margin = d.props.margin = current === 0 ? 10 : 0;
            }),
          );
      });
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev.footer.border(-0.1).render<T>((e) => {
      const data = e.state;
      return <Dev.Object name={name} data={data} expand={1} fontSize={11} />;
    });
  });
});
