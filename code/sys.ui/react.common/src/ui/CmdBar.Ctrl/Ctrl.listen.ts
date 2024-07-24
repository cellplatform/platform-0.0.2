import { Cmd, DEFAULTS, ObjectPath, type t } from './common';
import { Keyboard } from './Ctrl.keyboard';
import { Selection, toCmd, toPaths } from './u';

/**
 * Behavior logic for command signals.
 */
export function listen(args: {
  ctrl: t.CmdBarCtrl;
  textbox: t.TextInputRef;
  useKeyboard?: boolean;
  dispose$?: t.UntilObservable;
}): t.Lifecycle {
  const { ctrl, textbox, useKeyboard = DEFAULTS.useKeyboard } = args;
  const cmd = toCmd(ctrl);
  const transport = Cmd.transport(cmd);
  const paths = toPaths(cmd);
  const events = cmd.events(args.dispose$);
  const isFocused = () => textbox.current.focused;

  if (useKeyboard) Keyboard.listen(ctrl, textbox, events.dispose$);

  events.on('Current', (e) => {
    const text = textbox.current.value;
    cmd.invoke('Current:res', { text }, e.tx);
  });

  events.on('Focus', (e) => {
    const { target = 'CmdBar' } = e.params;
    if (target === 'CmdBar') {
      textbox.focus();
      textbox.caretToEnd();
    }
  });
  events.on('Select', (e) => {
    const scope = e.params.scope ?? 'All';
    if (scope === 'All') textbox.selectAll();
    if (scope === 'Expand') Selection.expandBack(textbox);
    if (scope === 'Toggle:Full') Selection.toggleFull(textbox);
  });

  events.on('Caret:ToStart', () => textbox.caretToStart());
  events.on('Caret:ToEnd', () => textbox.caretToEnd());
  events.on('Keyboard', (e) => Keyboard.handleKeyAction(ctrl, e.params, isFocused()));
  events.on('Clear', () => transport.change((d) => ObjectPath.mutate(d, paths.text, '')));

  return events;
}
