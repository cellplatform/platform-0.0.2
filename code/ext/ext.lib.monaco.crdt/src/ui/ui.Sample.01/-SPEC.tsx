import type * as t from './-SPEC.t';
import { CrdtInfo, Dev, Store, WebStore, MonacoEditor, TestDb, Doc } from '../../test.ui';
import { setupStore, type D } from './-SPEC.store';

type T = { reload?: boolean };

const initial: T = {};

/**
 * Spec
 */
const name = 'Sample.01';
export default Dev.describe(name, async (e) => {
  const { db, store, index, doc } = await setupStore(`spec:${name}`);
  let monaco: t.Monaco;
  let editor: t.MonacoCodeEditor;

  console.group('🌳 state');
  console.log(`db: "${db.name}"`);
  console.log('store', store);
  console.log('index', index);
  console.groupEnd();

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);

    const state = await ctx.state<T>(initial);
    await state.change((d) => {});

    ctx.debug.width(330);
    ctx.subject
      .backgroundColor(1)
      .size('fill')
      .display('grid')
      .render<T>((e) => {
        if (e.state.reload) {
          return <TestDb.DevReload onCloseClick={() => state.change((d) => (d.reload = false))} />;
        } else {
          return (
            <MonacoEditor
              focusOnLoad={true}
              onReady={(e) => {
                monaco = e.monaco;
                editor = e.editor;
                const lens = Doc.lens<D, t.CodeDoc>(doc, ['sample'], (d) => (d.sample = {}));
                // EditorCrdt.syncer({ monaco, editor, lens });

                // const m: t.Lens<t.CodeDoc> = lens;
                console.group('⚡️ MonacoEditor.onReady');
                console.log('event', e);
                console.log('lens', lens);
                console.groupEnd();
              }}
            />
          );
        }
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.row((e) => {
      return (
        <CrdtInfo
          fields={['Module', 'Component', 'Repo']}
          data={{
            component: { name, label: 'Syncer: UI ↔︎ Data' },
            repo: { store, index },
          }}
        />
      );
    });

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      dev.button('tmp', (e) => {
        doc.change((d) => {
          d.count++;
          const sample = d.sample || (d.sample = { code: '' });

          sample.code = 'hello world 👋\n';
        });
      });

      dev.hr(-1, 5);

      dev.button([`delete db: "${db.name}"`, '💥'], async (e) => {
        await e.change((d) => (d.reload = true));
        await TestDb.Spec.deleteDatabase();
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
