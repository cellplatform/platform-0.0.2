import { type t } from './common';

/**
 * Common mutatation functions for data objects.
 */
export const Mutate = {
  /**
   * Update the [Shared] document from an [Index] item.
   */
  shared(
    draft: t.CrdtShared,
    index: t.StoreIndexDoc,
    options: { debugLabel?: string; action?: t.CrdtSharedMutateAction } = {},
  ) {
    const { debugLabel, action } = options;
    const uri = index.uri;

    const getVersions = () => {
      return {
        index: index.shared?.version.value ?? -1,
        shared: draft.docs[uri]?.version ?? -1,
      } as const;
    };

    const done = (error?: string) => {
      const shared = draft.docs[uri]?.current ?? false;
      const versions = getVersions();
      const version = Math.max(versions.index, versions.shared);
      return { uri, shared, version, error } as const;
    };

    if (index.meta?.ephemeral) return done('Invalid index item (ephemeral)');

    const version = getVersions();
    if (version.index < 0 && version.shared < 0) return done('Not ready to sync');

    if (version.index >= version.shared) {
      const shared = draft.docs[uri] ?? { current: false, version: 0 };
      shared.version = index.shared?.version.value ?? 0;
      shared.current = index.shared?.current ?? false;
      if (action === 'unshare') {
        shared.current = false;
        shared.version += 1;
      }
      if (!draft.docs[uri]) draft.docs[uri] = shared; // NB: ensure the shared object is attached to the CRDT.
    }

    return done();
  },
} as const;