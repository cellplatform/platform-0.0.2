import { t, Dev, expect } from './common';

export type TestPeer = t.DevPeer & { editor: t.MonacoCodeEditor };
export type TestCtx = {
  peer1: TestPeer;
  peer2: TestPeer;
};

/**
 * TODO 🐷
 * - test replacement (delete + add)
 * - caret locations
 * - startup (initial state) replacing the entire document (should merge)
 */

export default Dev.describe('MonacoCrdt', (e) => {
  e.it('text syncs to second editor', async (e) => {
    const ctx = Wrangle.ctx(e);
    ctx.peer1.editor.setValue('hello world');
  });
});

/**
 * Helpers
 */
const Wrangle = {
  ctx(e: t.TestHandlerArgs) {
    return e.ctx as TestCtx;
  },
};
