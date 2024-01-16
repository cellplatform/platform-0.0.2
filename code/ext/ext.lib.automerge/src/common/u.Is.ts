import { DocHandle, isValidAutomergeUrl } from '@automerge/automerge-repo';
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel';
import { Typenames } from './constants';
import { PatchState, Value } from './libs';
import type * as t from './t';

export const Is = {
  automergeUrl(input: any): input is t.AutomergeUrl {
    return typeof input === 'string' ? isValidAutomergeUrl(input) : false;
  },

  docRef<T>(input: any): input is t.DocRef<T> {
    if (!isObject(input)) return false;
    return (
      Is.automergeUrl(input.uri) &&
      input.handle instanceof DocHandle &&
      typeof input.instance === 'string' &&
      typeof input.change === 'function' &&
      typeof input.events === 'function' &&
      typeof input.toObject === 'function'
    );
  },

  store(input: any): input is t.Store {
    if (!isObject(input) || !isObject(input.doc)) return false;
    if (!Is.repo(input.repo)) return false;
    return (
      typeof input.doc.factory === 'function' &&
      typeof input.doc.exists === 'function' &&
      typeof input.doc.get === 'function' &&
      typeof input.doc.getOrCreate === 'function'
    );
  },

  storeIndex(input: any): input is t.StoreIndexState {
    if (!isObject(input)) return false;
    const index = input as t.StoreIndexState;
    return index.kind === 'crdt.store.index' && Is.store(index.store);
  },

  webStore(input: any): input is t.WebStore {
    return typeof input.Provider === 'function' && Is.store(input);
  },

  repo(input: any): input is t.Repo {
    if (!isObject(input)) return false;
    const { networkSubsystem, storageSubsystem } = input;
    if (!Is.networkSubsystem(networkSubsystem)) return false;
    if (storageSubsystem && !Is.storageSubsystem(storageSubsystem)) return false;
    return true;
  },

  repoIndex(input: any): input is t.StoreIndex {
    if (!isObject(input)) return false;
    const subject = input as t.StoreIndex;
    return Array.isArray(subject.docs);
  },

  repoListState(input: any): input is t.RepoListState {
    if (!isObject(input)) return false;
    return PatchState.Is.type(input, Typenames.RepoList.List);
  },

  repoListModel(input: any): input is t.RepoListModel {
    if (!isObject(input)) return false;
    const { list, store, index } = input as t.RepoListModel;
    return Is.repoListState(list?.state) && Is.webStore(store) && Is.storeIndex(index);
  },

  networkSubsystem(input: any): input is t.Repo['networkSubsystem'] {
    if (!isObject(input)) return false;
    return (
      typeof input.peerId === 'string' &&
      typeof input.isReady === 'function' &&
      typeof input.whenReady === 'function' &&
      typeof input.send === 'function'
    );
  },

  storageSubsystem(input: any): input is Required<t.Repo['storageSubsystem']> {
    if (!isObject(input)) return false;
    return (
      typeof input.loadDoc === 'function' &&
      typeof input.saveDoc === 'function' &&
      typeof input.remove === 'function'
    );
  },

  broadcastChannel(input: any): input is BroadcastChannelNetworkAdapter {
    return input instanceof BroadcastChannelNetworkAdapter;
  },

  namespace<R extends {}, N extends string = string>(
    input: any,
  ): input is t.NamespaceManager<R, N> {
    if (!isObject(input)) return false;
    const obj = input as t.NamespaceManager<any>;
    return (
      obj.kind === 'crdt:namespace' &&
      typeof obj.lens === 'function' &&
      typeof obj.list === 'function'
    );
  },
} as const;

/**
 * Helpers
 */
export function isObject(input: any): input is Object {
  return input !== null && typeof input === 'object';
}
