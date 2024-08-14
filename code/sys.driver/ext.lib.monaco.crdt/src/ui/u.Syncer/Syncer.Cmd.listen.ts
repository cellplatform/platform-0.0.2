import { ObjectPath, rx, Time, type t } from './common';
import { Util } from './u';

type PathsInput = t.EditorPaths | t.ObjectPath;

/**
 * Start <Cmd> controller for the code-editor.
 */
export function listen(
  ctrl: t.SyncCmdMethods,
  args: {
    lens: t.Immutable;
    editor: t.MonacoCodeEditor;
    self: t.IdString;
    carets: t.EditorCarets;
    paths?: PathsInput;
    dispose$?: t.UntilObservable;
  },
) {
  const { self, lens, carets, editor } = args;
  const cmd = Util.Cmd.toCmd(ctrl);
  const paths = Util.Path.wrangle(args.paths);
  const Mutate = ObjectPath.Mutate;

  const life = rx.lifecycle(args.dispose$);
  const { dispose, dispose$ } = life;
  const events = Util.Cmd.toCmd(ctrl).events(dispose$);

  /**
   * Handlers
   */
  events.on('Ping', (e) => {
    if (e.params.identity === self) {
      cmd.invoke('Ping:R', { identity: self, ok: true }, e.tx);
    }
  });

  events.on('Purge', async (e) => {
    if (e.params.identity === self) {
      const res = await Util.Cmd.purge(ctrl, { lens, self, paths });
      cmd.invoke('Purge:R', res, e.tx);
    }
  });

  events.on('Update:State', async (e) => {
    if (e.params.identity !== self) return;

    if (e.params.selections) {
      const path = Util.Path.identity(self, paths).selections;
      const selections = editor.getSelections();
      lens.change((d) => Mutate.value(d, path, selections));
      await Time.wait(0);
    }
  });

  events.on('Update:Editor', async (e) => {
    if (e.params.identity !== self) return;

    if (e.params.selections) {
      const identities = Util.Identity.resolveIdentities(lens, paths);
      Object.keys(identities)
        .filter((key) => key !== self)
        .forEach((key) => {
          const selections = identities[key]?.selections;
          carets.identity(key).change({ selections });
        });
    }

    if (e.params.text) {
      const text = ObjectPath.resolve<string>(lens.current, paths.text) ?? '';
      editor.setValue(text);
    }
  });

  /**
   * API
   */
  return {
    dispose,
    dispose$,
    get disposed() {
      return life.disposed;
    },
  } as const;
}