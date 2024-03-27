import type { t } from './common';
export type * from './t.Events';

type Uri = t.DocUri | string;
type Initial<T> = t.ImmutableNext<T>;

/**
 * The address of a document within the repo/store.
 */
export type DocUri = t.AutomergeUrl;

/**
 * An immutable/observable CRDT document reference.
 */
export type DocRef<T = unknown> = t.ImmutableRef<T, t.DocEvents<T>> & {
  readonly uri: t.DocUri;
  readonly is: { ready: boolean; deleted: boolean };
  toObject(): T;
};

/**
 * A complete reference-handle to a CRDT document
 * including the underlying automerge-repo handle.
 *
 * NOTE:
 *    This is not returned directly by the getter functions
 *    so as to provide a consistent API without inconsistencies
 *    being exposed. A DocRefHandle<T> can be cast from a DocRef<T>
 *    when and IF you know what you're doing.
 */
export type DocRefHandle<T = unknown> = DocRef<T> & { readonly handle: t.DocHandle<T> };

/**
 * Generator function that produces a stongly-typed document
 * with a curried initial state.
 */
export type DocFactory<T> = (uri?: Uri) => Promise<t.DocRef<T>>;

/**
 * Document access exposed from a store/repo.
 */
export type DocStore = {
  factory<T>(initial: Initial<T>): t.DocFactory<T>;
  exists(uri?: Uri, options?: TOptions): Promise<boolean>;
  get<T>(uri?: Uri, options?: TOptions): Promise<t.DocRef<T> | undefined>;
  getOrCreate<T>(initial: Initial<T>, uri?: Uri, options?: TOptions): Promise<t.DocRef<T>>;
  delete(uri?: Uri, options?: TOptions): Promise<boolean>;
};
type TOptions = { timeout?: t.Msecs };

/**
 * Common meta-data object that can decorate CRDT documents
 * on a hidden key, eg { .meta: {} }
 */
export type DocWithMeta = { '.meta': DocMeta };
export type DocMetaType = { name: string };
export type DocMeta = { type?: t.DocMetaType; ephemeral?: boolean };

/**
 * History
 */
export type DocHistory<T = unknown> = {
  readonly length: number;
  readonly commits: DocHistoryCommit<T>[];
  readonly latest: DocHistoryCommit<T>;
  readonly genesis?: DocHistoryGenesis<T>;
  page(index: t.Index, limit: number, sort?: t.SortOrder): DocHistoryPage<T>;
};
export type DocHistoryGenesis<T = unknown> = {
  readonly initial: DocHistoryCommit<T>;
  readonly elapsed: t.TimeDuration;
};
export type DocHistoryCommit<T = unknown> = t.State<T>;

export type DocHistoryListItem<T = unknown> = {
  readonly index: t.Index;
  readonly commit: t.DocHistoryCommit<T>;
};

export type DocHistoryPage<T = unknown> = {
  readonly length: number;
  readonly index: number;
  readonly limit: number;
  readonly total: number;
  readonly order: t.SortOrder;
  readonly items: DocHistoryListItem<T>[];
  readonly commits: DocHistoryCommit<T>[];
};