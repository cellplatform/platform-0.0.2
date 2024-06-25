import type { t } from './common';

export type * from './t.Events';
export type * from './t.Shared';

type Uri = string;
type UriInput = Uri | Uri[];
type AddInput = t.StoreIndexAddParam | Uri;

/**
 * A CRDT that represents an index of a store/repo.
 */
export type StoreIndexState = {
  readonly store: t.Store;
  readonly doc: t.DocRef<t.StoreIndex>;
  readonly toggleShared: t.StoreIndexToggleShared;
  events(dispose$?: t.UntilObservable): t.StoreIndexEvents;
  exists(uri: UriInput): boolean;
  total(filter?: t.StoreIndexFilter): number;
  add(doc: AddInput | AddInput[]): Promise<number>;
  remove(uri: UriInput): number;
};
export type StoreIndexAddParam = { uri: Uri; name?: string; shared?: boolean };

export type StoreIndexFilter = (e: StoreIndexFilterArgs, index: number) => boolean;
export type StoreIndexFilterArgs = { doc: t.StoreIndexDoc; index: number };

/**
 * Index of documents within a store/repository.
 */
export type StoreIndex = t.DocWithMeta & { docs: t.StoreIndexDoc[] };
export type StoreIndexDoc = {
  uri: Uri;
  name?: string;
  meta?: Pick<t.DocMeta, 'ephemeral'>;
  shared?: t.StoreIndexItemShared;
};
