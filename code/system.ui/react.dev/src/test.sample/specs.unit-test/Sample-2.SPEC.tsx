import { Spec, TestLog } from '../common';

export function Wrapper() {
  const log = TestLog.create();

  const root = Spec.describe('MySample', (e) => {
    e.it('init', async (e) => {
      const ctx = Spec.ctx(e);

      ctx.component
        .size(300, 140)
        .display('flex')
        .backgroundColor(1)
        .render((e) => <div>Hello</div>);
      log.push(e, ctx);
    });

    e.it('foo-1', async (e) => {
      const ctx = Spec.ctx(e);
      ctx.debug.render(() => <div>{`Hello Foo!`}</div>);
      log.push(e, ctx);
    });

    e.it('foo-2', async (e) => {
      const ctx = Spec.ctx(e);
      log.push(e, ctx);
    });
  });

  return { root, log };
}

export const root = Wrapper().root;
export default root;
