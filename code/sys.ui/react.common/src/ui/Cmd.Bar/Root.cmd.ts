import { Cmd, Immutable, type t } from './common';

/**
 * Command API for the component.
 */
export const Ctrl = {
  create(transport?: t.CmdImmutable) {
    type C = t.CmdBarCtrlCmdType;
    const doc = transport ?? Immutable.clonerRef({});
    const cmd = Cmd.create<C>(doc) as t.CmdBarCtrl;
    return { cmd, ...Ctrl.methods(cmd) } as const;
  },

  methods(cmd: t.CmdBarCtrl) {
    return {
      focus: cmd.method('Focus'),
      blur: cmd.method('Blur'),
      selectAll: cmd.method('SelectAll'),
      caretToStart: cmd.method('CaretToStart'),
      caretToEnd: cmd.method('CaretToEnd'),
    } as const;
  },
} as const;
