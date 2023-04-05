import { t, rx, DEFAULTS, slug } from './common';

/**
 * Saves log files to disk on each unit-change to the CRDT document.
 */
export function saveLogStrategy<D extends {} = {}>(
  dir: t.Fs,
  onChange$: t.Observable<t.CrdtDocRefChangeHandlerArgs<D>>,
  dispose$: t.Observable<any>,
  onSave?: (e: t.CrdtFileActionSaved) => void,
) {
  const logdir = dir.dir(DEFAULTS.doc.logdir);
  onChange$
    .pipe(
      rx.takeUntil(dispose$),
      rx.filter((e) => e.change instanceof Uint8Array),
    )
    .subscribe(async (e) => {
      const count = (await logdir.manifest()).files.length;
      const filename = `${count}.${slug()}`;
      const { bytes, hash } = await logdir.write(filename, e.change);
      onSave?.({ action: 'saved:log', filename, bytes, hash });
    });
}
