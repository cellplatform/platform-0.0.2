import { useEffect, useState } from 'react';
import { CmdHost, DEFAULTS, ObjectPath, Sync, rx, type t } from './common';
import { CmdHostPath } from './u';

type O = Record<string, unknown>;
type E = t.LensEvents | t.DocEvents;

/**
 * Controls the interaction between a <CmdHost> and a CRDT document.
 */
export function useController(args: {
  enabled?: boolean;
  doc?: t.Lens | t.DocRef;
  path?: t.CmdHostPaths;
  imports?: t.ModuleImports;
  debug?: string;
}) {
  const { enabled = true, doc, path = DEFAULTS.paths, debug, imports } = args;
  const [selectedUri, setSelectedUri] = useState('');
  const [cmd, setCmd] = useState('');
  const [textbox, setTextbox] = useState<t.TextInputRef>();

  const resolve = CmdHostPath.resolver(path);
  function changedValue<T>(events: E | undefined, resolve: (doc: O) => T) {
    return events?.changed$.pipe(
      rx.filter(() => !!doc),
      rx.map((e) => e.after),
      rx.distinctWhile((prev, next) => resolve(prev) === resolve(next)),
      rx.map((after) => resolve(after)),
    );
  }

  const filter: t.CmdHostFilter = (imports, command) => {
    let cmd = (command || '').trim();
    if (!cmd.trim().startsWith('?')) return imports;
    return CmdHost.DEFAULTS.filter(imports, cmd.replace(/^\?/, ''));
  };

  /**
   * Textbox syncer (splice)
   */
  useEffect(() => {
    const life = rx.disposable();
    const { dispose$ } = life;
    if (enabled && doc && textbox) {
      const initial = resolve.cmd.text(doc.current);
      const listener = Sync.Textbox.listen(textbox, doc, path.cmd.text, { dispose$ });
      setCmd(initial ?? '');
      listener.onChange((e) => setCmd(e.text || ''));
    }
    return life.dispose;
  }, [enabled, doc?.instance, !!textbox, path.cmd.text.join('.')]);

  /**
   * Selected item
   */
  useEffect(() => {
    const events = doc?.events();
    const changed$ = changedValue(events, (doc) => resolve.uri.selected(doc) ?? '');
    changed$?.subscribe((uri) => setSelectedUri(uri));
    return events?.dispose;
  }, [enabled, doc?.instance, path.uri.selected.join('.')]);

  /**
   * Loader (URI)
   */
  useEffect(() => {
    const events = doc?.events();
    const changed$ = changedValue(events, (doc) => resolve.uri.loaded(doc) ?? '');

    changed$?.pipe(rx.filter((uri) => !!uri)).subscribe(async (uri) => {
      const importer = imports?.[uri];

      /**
       * TODO 🐷
       * Load the module, render and display it <somehow/somewhere>.
       */
      console.log(debug, 'URI', uri, await importer?.());
    });
    return events?.dispose;
  }, [enabled, !!imports, doc?.instance]);

  /**
   * API
   */
  return {
    filter,
    cmd,
    textbox,
    selected: {
      uri: selectedUri,
      get index() {
        if (!imports) return -1;
        return Object.keys(imports).findIndex((uri) => uri === selectedUri);
      },
    },

    async load(address?: t.UriString) {
      doc?.change((d) => ObjectPath.mutate(d, path.uri.loaded, address || ''));
    },

    onTextboxReady(textbox: t.TextInputRef) {
      setTextbox(textbox);
    },

    onSelectionChange(uri?: t.UriString) {
      doc?.change((d) => ObjectPath.mutate(d, path.uri.selected, uri || ''));
    },
  } as const;
}
