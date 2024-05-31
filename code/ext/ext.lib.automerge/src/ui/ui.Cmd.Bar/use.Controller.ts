import { useEffect, useRef, useState } from 'react';
import { DEFAULTS, Is, Sync, Time, rx, type t, Cmd } from './common';
import { Events, Path } from './u';

type Args = {
  instance: string;
  enabled?: boolean;
  doc?: t.Lens | t.DocRef;
  paths?: t.CmdBarPaths;
  debug?: string;
  focusOnReady?: boolean;
  handlers?: t.CmdBarHandlers;
};

type ReadyRef = 'focus';

/**
 * State sync/interaction controller.
 */
export function useController(args: Args) {
  const { instance, doc, handlers = {}, paths = DEFAULTS.paths } = args;

  const enabled = wrangle.enabled(args);
  const debug = wrangle.debug(args);
  const resolve = Path.resolver(paths);

  const cmdRef = useRef<t.CmdBarCmd>();
  const getCmd = () => {
    type C = t.CmdBarType;
    if (!cmdRef.current) cmdRef.current = doc ? Cmd.create<C>(doc, paths.cmd) : undefined;
    return cmdRef.current;
  };

  const readyRef = useRef<ReadyRef[]>([]);
  const ready = readyRef.current;

  const [textbox, setTextbox] = useState<t.TextInputRef>();
  const [text, setText] = useState('');

  /**
   * Textbox CRDT syncer (splice).
   */
  useEffect(() => {
    const life = rx.disposable();
    if (enabled && doc && textbox) {
      const { dispose$ } = life;
      const listener = Sync.Textbox.listen(textbox, doc, paths.text, { debug, dispose$ });
      listener.onChange((e) => api.onChange(e.text, e.pos));
      api.onChange(resolve.text(doc.current)); // initial.
    }
    return life.dispose;
  }, [enabled, doc?.instance, !!textbox, paths.text.join('.')]);

  /**
   * CRDT document listeners.
   */
  useEffect(() => {
    const events = Events.create({ instance, doc, paths });
    events.text$.subscribe((e) => handlers.onText?.(e));
    events.cmd.$.subscribe((e) => handlers.onCommand?.(e));
    events.cmd.tx$.subscribe((e) => handlers.onInvoke?.(e));
    return events.dispose;
  }, [enabled, doc?.instance]);

  /**
   * Ready: focus.
   */
  useEffect(() => {
    if (ready.includes('focus')) return;
    if (enabled && textbox && args.focusOnReady) {
      textbox.focus();
      ready.push('focus');
    }
  }, [enabled, !!textbox, args.focusOnReady]);

  /**
   * API
   */
  const api = {
    text: text || undefined,
    get is() {
      return { enabled, lens: Is.lens(doc), doc: Is.docRef(doc) };
    },

    onReady(ref: t.TextInputRef) {
      setTextbox(ref);
    },
    onChange(text: string, pos?: t.Index) {
      setText(text);
      if (textbox && typeof pos === 'number') Time.delay(0, () => textbox?.select(pos));
    },
    onEnter() {
      getCmd()?.invoke('Invoke', { text, action: 'Enter' });
    },
  } as const;
  return api;
}

/**
 * Helpers
 */
const wrangle = {
  enabled(args: Args) {
    const { doc, enabled = true } = args;
    return doc ? enabled : false;
  },

  debug(args: Args) {
    const { instance = 'Unknown', debug } = args;
    return debug ? `${debug}:${instance}` : instance;
  },
} as const;
