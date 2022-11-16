import { distinctUntilChanged } from 'rxjs/operators';

import { Fetch } from '../Fetch.mjs';
import { FetchFile, Storage } from '../Storage';
import { BusEvents } from './BusEvents.mjs';
import { BusMemoryState } from './BusMemoryState.mjs';
import { DEFAULTS, Pkg, R, rx, t, Time } from './common.mjs';
import { Paths } from './Paths.mjs';

type UrlString = string;

/**
 * Event controller.
 */
export function BusController(args: {
  instance: t.StateInstance;
  filter?: (e: t.StateEvent) => boolean;
  dispose$?: t.Observable<any>;
  initial?: { location?: UrlString };
}): t.StateEvents {
  const { filter, initial = {} } = args;
  const bus = rx.busAsType<t.StateEvent>(args.instance.bus);
  const instance = args.instance.id || DEFAULTS.instance;

  const localstorage = Storage.Local.object<t.LocalStorageState>('ui.state', {
    selection: DEFAULTS.state.selection,
    env: DEFAULTS.state.env,
  });

  const state = BusMemoryState({
    location: initial.location,
    env: localstorage.current.env,
  });

  const events = BusEvents({
    instance: args.instance,
    dispose$: args.dispose$,
    filter,
  });
  const { dispose$ } = events;

  const fireChanged = (messages: string[]) => {
    Time.delay(0, () => {
      events.changed.fire(...messages);
    });
  };

  // let _fs: t.Fs | undefined;
  // const getFilesystem = async () => _fs ?? (_fs = await FetchFile.fs({ bus, dispose$ }));

  /**
   * Info (Module)
   */
  events.info.req$.subscribe(async (e) => {
    const { tx } = e;
    const { name = '', version = '' } = Pkg;
    const current = state.current;

    const info: t.StateInfo = {
      module: { name, version },
      current,
    };

    bus.fire({
      type: 'app.state/info:res',
      payload: { tx, instance, info },
    });
  });

  /**
   * Fetch Data
   */
  events.fetch.req$.subscribe(async (e) => {
    const { tx, topic = [] } = e;

    let error: string | undefined;
    const commits: string[] = [];

    /**
     * FETCH: Outline (Markdown)
     */
    if (!error && topic.includes('RootIndex')) {
      /**
       * TODO
       *  - Figure out how to not hard-code this path.
       *   by looking it up in some kind of "semi-strongly typed" content-manifest.
       */

      const updateState = async (text: string) => {
        const commit = 'Fetched outline';
        await state.change(commit, (tree) => {
          const markdown = tree.markdown || (tree.markdown = {});
          markdown.outline = text;
        });
        commits.push(commit);
      };

      const fetchRemote = async () => {
        const res = await Fetch.text(path);
        if (res.error) error = res.error;
        if (!error) {
          await updateState(res.text);
        }
      };

      /**
       * TEMP HACK:DESIGN placeholder locic 🐷
       * Future Refactor:
       *    Notes:
       *      - Reads to the local filesystem (IndexedDb).
       *      - If not in local file-system FETCH from the corresponding "data.md" file in the remote data store.
       *      - The write (local fs update) is below in the "changed" handler.
       * TODO:
       *  - reset local store (fs) to read remote (concept perhaps: "sync:remote:pull" <=> "sync:remote:push")
       *  - fs: fetch/pull from URL.
       *
       */
      // const fs = await getFilesystem();
      const path = Paths.schema.index;

      // if (await fs.exists(path)) {
      /**
       * SAVE
       */
      // const data = await fs.read(path);
      // const text = data ? new TextDecoder().decode(data) : '';
      // await updateState(text);
      // } else {
      //   // await fetchRemote();
      // }

      await fetchRemote();
    }

    /**
     * FETCH: Log (JSON)
     */
    if (!error && topic.includes('Log')) {
      const history = await Fetch.logHistory();
      if (history) {
        const commit = 'Fetched log history';
        await state.change(commit, (draft) => (draft.log = history));
        commits.push(commit);
      }
    }

    const current = state.current;
    bus.fire({
      type: 'app.state/fetch:res',
      payload: { tx, instance, current, error },
    });

    if (commits.length > 0) fireChanged(commits);
  });

  /**
   * Selection Change
   */
  events.select.$.subscribe(async (e) => {
    const path = e.selected;

    const getEditorPath = () => {
      return path ? Paths.toDataPath(path) : Paths.schema.index;
    };

    const next: t.StateSelection = {};
    if (path) next.index = { path };

    if (!R.equals(next, state.current.selection)) {
      /**
       * Update local state.
       */
      const commit = 'Selection changed';
      await state.change(commit, (draft) => {
        const selection = next ? next : DEFAULTS.state.selection;
        draft.selection = selection;
      });
      fireChanged([commit]);
    }
  });

  /**
   * Change (Update)
   */
  events.change.req$.subscribe(async (e) => {
    const { tx, message } = e;
    let error: string | undefined;

    try {
      await state.change(e.message, e.handler);
      fireChanged([message]);

      /**
       * HACK 🐷
       * Temporary filesystem store
       */
      // const fs = await getFilesystem();
      // const markdown = state.current.markdown;
      // const url = state.current.selection.index?.path;
      // const hasSelection = Boolean(url);
      // const data = (hasSelection ? markdown?.document : markdown?.outline) ?? '';
      // if (data) {
      //   const path = hasSelection ? Paths.toDataPath(url ?? '') : Paths.schema.index;
      //   await fs.write(path, data);
      // }
    } catch (err: any) {
      error = err.message;
    }

    const current = state.current;
    bus.fire({
      type: 'app.state/change:res',
      payload: { tx, instance, current, message, error },
    });
  });

  /**
   * MONITOR: Save changes to local-storage.
   */
  const isLocalStorageChange = (p: t.StateChanged, n: t.StateChanged) => {
    const prev = p.current;
    const next = n.current;
    if (prev.selection.index?.path !== next.selection.index?.path) return false;
    if (!R.equals(prev.env, next.env)) return false;
    return true;
  };
  events.changed.$.pipe(distinctUntilChanged(isLocalStorageChange)).subscribe(async (e) => {
    const current = e.current;
    localstorage.merge({
      selection: current.selection,
      env: current.env,
    });
  });

  /**
   * MONITOR: Load document upon selection change.
   */
  events.changed.$.pipe(
    distinctUntilChanged(
      (prev, next) => prev.current.selection.index?.path === next.current.selection.index?.path,
    ),
  ).subscribe(async (e) => {
    const url = e.current.selection.index?.path;

    const commit = 'Load document after URL selection change';
    await state.change(commit, async (draft) => {
      const markdown = draft.markdown ?? (draft.markdown = {});
      const before = markdown.document;
      if (!url) {
        markdown.document = undefined;
      } else {
        const path = Paths.toDataPath(url);
        const { text, error } = await Fetch.text(path);
        markdown.document = error ? undefined : text;
      }
      if (markdown.document !== before) fireChanged([commit]);
    });
  });

  /**
   * Overlay
   */
  events.overlay.req$.subscribe(async (e) => {
    const { tx, def } = e;
    const commit = `Showing overlay`;
    await state.change(commit, (draft) => (draft.overlay = { tx, def }));
    fireChanged([commit]);
  });

  events.overlay.close$.subscribe(async (e) => {
    const errors = [...(e.errors ?? [])];
    const current = state.current;

    if (!current.overlay) {
      const error = `Cannot close overlay as one is not present on controller instance '${instance}'.`;
      errors.push(error);
    }

    if (current.overlay) {
      const commit = `Closing overlay`;
      await state.change(commit, (draft) => (draft.overlay = undefined));
      fireChanged([commit]);
    }

    const tx = current.overlay?.tx ?? '';
    bus.fire({
      type: 'app.state/overlay:res',
      payload: { tx, instance, errors },
    });
  });

  /**
   * Initialize
   */
  const init = async () => {
    const local = localstorage.current;

    events.select.fire(local.selection.index?.path);

    /**
     * TODO 🐷
     * - store "ready state" when asyncronously complete.
     * - fire "ready state changed" event.
     */
  };
  init();

  /**
   * Finish up
   */
  return events;
}
