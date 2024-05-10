export type * from './crdt/Doc.Lens/t';
export type * from './crdt/Doc.Namespace/t';
export type * from './crdt/Doc/t';

export type * from './crdt.sync/TextboxSync/t';

export type * from './crdt/Store.Index/t';
export type * from './crdt/Store/t';

export type * from './crdt/Store.Web.Index/t';
export type * from './crdt/Store.Web.IndexDb/t';
export type * from './crdt/Store.Web/t';

export type * from './ui/ui.CmdHost/t';
export type * from './ui/ui.History.Commit/t';
export type * from './ui/ui.History.Grid/t';
export type * from './ui/ui.Info/t';
export type * from './ui/ui.Nav.Paging/t';
export type * from './ui/ui.RepoList.Model/t';
export type * from './ui/ui.RepoList.Virtual/t';
export type * from './ui/ui.RepoList/t';

/**
 * Automerge JS object extensions.
 */
export interface AutomergeArray<T> extends Array<T> {
  deleteAt(index: number, total?: number): void;
  insertAt(index: number, ...items: T[]): void;
}
