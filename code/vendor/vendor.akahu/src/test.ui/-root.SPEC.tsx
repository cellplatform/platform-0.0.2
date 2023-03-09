import { Dev } from '../test.ui';

type T = { count: number };
const initial: T = { count: 0 };

export default Dev.describe('Akahu', (e) => {
  e.it('init', async (e) => {
    const ctx = Dev.ctx(e);
    const state = await ctx.state<T>(initial);
    ctx.subject
      .backgroundColor(1)
      .size(250, null)
      .display('grid')
      .render<T>((e) => {
        return <div>{`🐷 Hello-${e.state.count}`}</div>;
      });
  });

  e.it('debug panel', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev.footer
      .border(-0.1)
      .render<T>((e) => <Dev.Object name={'spec'} data={e.state} expand={1} />);

    dev.button('tmp', (e) => e.change((d) => d.count++));
  });
});
