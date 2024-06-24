import { Keyboard } from '.';
import { Time, describe, expect, it, rx, type t } from '../test';
import { KeyListener } from './KeyListener';
import { Mock } from './u.Mock';

describe('Keyboard', () => {
  describe('KeyListener', () => {
    it('fires (keydown | keyup)', async () => {
      const fired: KeyboardEvent[] = [];
      KeyListener.keydown((e) => fired.push(e));
      KeyListener.keyup((e) => fired.push(e));

      const downEvent = Mock.keydownEvent();
      const upEvent = Mock.keyupEvent();

      document.dispatchEvent(downEvent);
      document.dispatchEvent(upEvent);

      await Time.wait(0);

      expect(fired.length).to.eql(2);
      expect(fired[0]).to.equal(downEvent);
      expect(fired[1]).to.equal(upEvent);
    });

    it('dispose: removes event listener', async () => {
      /**
       * NOTE: The removing of the event handlers (in particular when multiple handlers
       *       are in play) is done correctly in the borser, however [happy-dom] does not behave
       *       accurately and removes all handlers.
       *
       *       This test only asserts the removal of the event, but does not attempt to
       *       simulate within [happy-dom] any further than this.
       */
      const fired: KeyboardEvent[] = [];
      const keydown = KeyListener.keydown((e) => fired.push(e));
      const keyup = KeyListener.keyup((e) => fired.push(e));

      keydown.dispose();
      keyup.dispose(); // NB: Keyup-2 not disposed.

      const downEvent = Mock.keydownEvent();
      const upEvent = Mock.keyupEvent();

      Mock.fire(downEvent);
      Mock.fire(upEvent);

      await Time.wait(0);
      expect(fired.length).to.eql(0);
    });
  });

  describe('Keyboard.until', () => {
    it('on: stops after disposal', () => {
      const life = rx.disposable();
      const keys = Keyboard.until(life.dispose$);
      const fired: t.KeyboardKeypress[] = [];
      keys.on('KeyZ', (e) => fired.push(e.event));

      Mock.fire();
      expect(fired.length).to.eql(1);

      life.dispose();
      expect(keys.disposed).to.eql(true);

      Mock.fire();
      expect(fired.length).to.eql(1);
    });
  });

});
