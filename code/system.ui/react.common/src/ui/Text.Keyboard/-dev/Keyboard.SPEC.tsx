import { Keyboard } from '..';
import { Dev, t } from '../../../test.ui';
import { DevSample } from './DEV.Sample';

type T = { keyboard: t.KeyboardState };
const initial: T = {
  keyboard: Keyboard.Monitor.state,
};

export default Dev.describe('KeyboardMonitor', (e) => {
  e.it('init', async (e) => {
    const ctx = Dev.ctx(e);
    const state = await ctx.state<T>(initial);

    Keyboard.Monitor.subscribe((current) => state.change((d) => (d.keyboard = current)));

    const pattern = 'CMD + L';
    Keyboard.Monitor.on(pattern, (e) => {
      e.cancel();
      console.group('🌳 ');
      console.info(`match pattern: "${pattern}"`);
      console.info(`pressed:`, e.state.pressed);
      console.log('e', e);
      console.groupEnd();
    });

    ctx.subject
      .display('grid')
      .size(540, 300)
      .render<T>((e) => <DevSample state={e.state.keyboard} />);
  });

  e.it('debug panel', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev.footer
      .border(-0.1)
      .render<T>((e) => (
        <Dev.Object
          name={'spec.KeyboardMonitor'}
          data={e.state.keyboard}
          expand={{ level: 1, paths: ['$.current.pressed', '$.current', '$.current.pressed.*'] }}
        />
      ));

    dev.row(async (e) => {
      const { EventProps } = await Keyboard.ui.EventProps();
      const event = e.state.keyboard.last;
      return <EventProps event={event} style={{ MarginX: 15, marginTop: 5 }} />;
    });
  });
});
