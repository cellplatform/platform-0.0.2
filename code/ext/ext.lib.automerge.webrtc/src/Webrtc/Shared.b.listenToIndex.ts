import { Sync } from './Shared.Sync';
import { type t } from './common';

/**
 * Setup event listener for an [Index] to keep it synced into the [Shared] document.
 */
export function listenToIndex(
  index: t.StoreIndexState,
  shared: t.DocRefHandle<t.CrdtShared>,
  options: { debugLabel?: string; dispose$?: t.UntilObservable } = {},
) {
  const { debugLabel, dispose$ } = options;
  const events = index.events(dispose$);
  const change = (indexItem: t.StoreIndexDoc, action?: t.CrdtSharedMutateAction) => {
    shared.change((d) => Sync.Mutate.shared(d, indexItem, { action, debugLabel }));
  };
  events.added$.subscribe((e) => change(e.item));
  events.shared$.subscribe((e) => change(e.item));
  events.renamed$.subscribe((e) => change(e.item));
  events.removed$.subscribe((e) => change(e.item, 'unshare'));
}
