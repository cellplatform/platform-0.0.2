import { describe, expect, it, Time } from '../test';
import { KeyListener } from './KeyListener.mjs';

describe('KeyListener', () => {
  const Mock = {
    keydownEvent() {
      return new window.KeyboardEvent('keydown', { key: 'z', keyCode: 90 });
    },
    keyupEvent() {
      return new window.KeyboardEvent('keydown', { key: 'z', keyCode: 90 });
    },
  };

  it('fires (keydown | keyup)', async () => {
    let _fired: KeyboardEvent[] = [];
    KeyListener.keydown((e) => _fired.push(e));
    KeyListener.keyup((e) => _fired.push(e));

    const downEvent = Mock.keydownEvent();
    const upEvent = Mock.keyupEvent();

    document.dispatchEvent(downEvent);
    document.dispatchEvent(upEvent);

    await Time.wait(0);

    expect(_fired.length).to.eql(2);
    expect(_fired[0]).to.equal(downEvent);
    expect(_fired[1]).to.equal(upEvent);
  });

  it('dispose: removes event listener', async () => {
    /**
     * NOTE: The removing of the event handlers (in particular when multiple handlers
     *       are in play) is done correctly in the borser, however JSDOM does not behave
     *       accurately and removes all handlers.
     *
     *       This tests only tests the removal of the event, but does not attempt to
     *       simulate within JSDOM any further than this.
     */

    let _fired: KeyboardEvent[] = [];

    const keydown = KeyListener.keydown((e) => _fired.push(e));
    const keyup = KeyListener.keyup((e) => _fired.push(e));

    keydown.dispose();
    keyup.dispose(); // NB: Keyup-2 not disposed.

    const downEvent = Mock.keydownEvent();
    const upEvent = Mock.keyupEvent();

    document.dispatchEvent(downEvent);
    document.dispatchEvent(upEvent);

    await Time.wait(0);

    expect(_fired.length).to.eql(0);
  });
});
