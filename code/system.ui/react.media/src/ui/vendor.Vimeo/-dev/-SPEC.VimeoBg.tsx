import { Dev } from '../../../test.ui';
import { rx, slug, type t } from '../common';

import { VimeoBackground } from '..';
import { VIDEO } from './-Sample.mjs';

const initial = { count: 0 };
type T = typeof initial;

export default Dev.describe('VimeoBackground Player', (e) => {
  let events: t.VimeoEvents;

  /**
   * Initialize
   */
  e.it('init', async (e) => {
    const ctx = Dev.ctx(e);

    const bus = rx.bus<t.VimeoEvent>();
    const instance = { bus, id: `foo.${slug()}` };
    events = VimeoBackground.Events({ instance });

    ctx.subject.size([800, 600]).render<T>((e) => {
      return (
        <VimeoBackground
          instance={instance}
          video={VIDEO['app/tubes']}
          opacity={1}
          opacityTransition={300}
          blur={0}
        />
      );
    });
  });

  e.it('ui:debug', (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev
      .button((btn) => btn.label('Play').onClick((e) => events.play.fire()))
      .button((btn) => btn.label('Pause').onClick((e) => events.pause.fire()))
      .hr();
  });
});
