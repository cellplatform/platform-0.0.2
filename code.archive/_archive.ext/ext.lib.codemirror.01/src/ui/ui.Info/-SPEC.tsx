import { Info } from '.';
import { Dev, type t } from '../../test.ui';

type T = { props: t.InfoProps };
const initial: T = { props: {} };

const DEFAULTS = Info.DEFAULTS;

export default Dev.describe('Info', (e) => {
  type LocalStore = { selectedFields?: t.InfoField[] };
  const localstore = Dev.LocalStorage<LocalStore>('dev:ext.lib.codemirror.Info');
  const local = localstore.object({
    selectedFields: DEFAULTS.fields.default,
  });

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const state = await ctx.state<T>(initial);

    await state.change((d) => {
      d.props.fields = local.selectedFields;
      d.props.margin = 10;
    });

    ctx.debug.width(330);
    ctx.subject
      .backgroundColor(1)
      .size([320, null])
      .display('grid')
      .render<T>((e) => {
        return <Info {...e.state.props} />;
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev.TODO();

    dev.section('Fields', (dev) => {
      dev.row((e) => {
        const props = e.state.props;
        return (
          <Dev.FieldSelector
            all={DEFAULTS.fields.all}
            selected={props.fields}
            onClick={(ev) => {
              const fields = ev.next as t.InfoField[];
              dev.change((d) => (d.props.fields = fields));
              local.selectedFields = fields?.length === 0 ? undefined : fields;
            }}
          />
        );
      });
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev.footer.border(-0.1).render<T>((e) => {
      const data = e.state;
      return <Dev.Object name={'Info'} data={data} expand={1} />;
    });
  });
});
