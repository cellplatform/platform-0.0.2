import { useEffect, useState } from 'react';
import { DEFAULTS, ObjectPath, Sync, rx, type t } from './common';

export function useController(args: { enabled?: boolean; doc?: t.Lens; path?: t.CmdHostPaths }) {
  const { enabled = true, doc, path = DEFAULTS.paths } = args;

  const [value, setValue] = useState('');
  const [textbox, setTextbox] = useState<t.TextInputRef>();

  /**
   * Textbox syncer (splice).
   */
  useEffect(() => {
    const life = rx.disposable();
    const { dispose$ } = life;
    if (enabled && doc && textbox) {
      const initial = ObjectPath.resolve<string>(doc.current, path.cmd);
      const listener = Sync.Textbox.listen(textbox, doc, path.cmd, { dispose$ });
      listener.onChange((e) => setValue(e.text));
      setValue(initial ?? '');
    }
    return life.dispose;
  }, [enabled, doc?.instance, !!textbox, path.cmd.join('.')]);

  /**
   * API
   */
  return {
    value,
    textbox,
    onTextboxReady(textbox: t.TextInputRef) {
      setTextbox(textbox);
    },
  } as const;
}
