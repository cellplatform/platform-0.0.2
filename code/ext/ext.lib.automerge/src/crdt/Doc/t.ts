import type { t } from './common';
export type * from './t.Events';

type O = Record<string, unknown>;
type P = t.Patch;
type Uri = t.DocUri | t.UriString;
type Init<T> = t.ImmutableMutator<T>;

/**
 * The address of a document within the repo/store.
 */
export type DocUri = t.AutomergeUrl;

/**
 * An immutable/observable CRDT document reference.
 */
export type DocRef<T extends O = O> = t.ImmutableRef<T, t.DocEvents<T>, P> & {
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
export type DocRefHandle<T extends O = O> = DocRef<T> & { readonly handle: t.DocHandle<T> };

/**
 * Generator function that produces a stongly-typed document
 * with a curried initial state.
 */
export type DocFactory<T extends O> = (uri?: Uri) => Promise<t.DocRef<T>>;

/**
 * Document access exposed from a store/repo.
 */
export type DocStore = {
  exists(uri?: Uri, options?: GetOptions): Promise<boolean>;
  get<T extends O>(uri?: Uri, options?: GetOptions): Promise<t.DocRef<T> | undefined>;
  getOrCreate<T extends O>(
    initial: Init<T> | Uint8Array,
    uri?: Uri,
    options?: GetOptions,
  ): Promise<t.DocRef<T>>;
  delete(uri?: Uri, options?: GetOptions): Promise<boolean>;
  factory<T extends O>(initial: Init<T>): t.DocFactory<T>;
  toBinary<T extends O>(initOrDoc: t.ImmutableMutator<T> | t.DocRef<T>): Uint8Array;
  fromBinary<T extends O>(
    binary: Uint8Array,
    options?: FromBinaryOptions | t.UriString,
  ): t.DocRef<T>;
};

type GetOptions = { timeout?: t.Msecs };
type FromBinaryOptions = { uri?: Uri; dispose$?: t.UntilObservable };

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
export type DocHistory<T extends O = O> = {
  readonly length: number;
  readonly commits: DocHistoryCommit<T>[];
  readonly latest: DocHistoryCommit<T>;
  readonly genesis?: DocHistoryGenesis<T>;
  page(index: t.Index, limit: number, sort?: t.SortOrder): DocHistoryPage<T>;
};
export type DocHistoryGenesis<T extends O = O> = {
  readonly initial: DocHistoryCommit<T>;
  readonly elapsed: t.TimeDuration;
};
export type DocHistoryCommit<T extends O = O> = t.State<T>;

export type DocHistoryListItem<T extends O = O> = {
  readonly index: t.Index;
  readonly commit: t.DocHistoryCommit<T>;
};

export type DocHistoryPage<T extends O = O> = {
  readonly length: number;
  readonly index: number;
  readonly limit: number;
  readonly total: number;
  readonly order: t.SortOrder;
  readonly items: DocHistoryListItem<T>[];
  readonly commits: DocHistoryCommit<T>[];
};
