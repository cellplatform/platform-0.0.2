import { CmdBar, Doc, Monaco, type t } from './common';

const Syncer = Monaco.Crdt.Syncer;

/**
 *
 */
export function editorController(args: {
  editor: t.MonacoCodeEditor;
  monaco: t.Monaco;
  main: t.Main;
}) {
  const { monaco, editor, main } = args;

  // Document (State)
  type T = { config?: string };
  const lens = Doc.lens(main.me, ['root'], { init: (d) => (d.root = {}) });

  // TEMP 🐷 clear out old fields.
  lens.change((d) => {
    delete d['code'];
    // delete d['config'];
  });

  Syncer.listen<T>(monaco, editor, lens, ['config'], {});

  // Editor
  const cmdbar = CmdBar.Ctrl.methods(main.cmd.cmdbar);
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => cmdbar.focus({}));
}
