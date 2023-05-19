import { Crdt, t } from './common';

/**
 * Initialize a new state manager.
 */
export function init<N extends string = string>(doc: t.NetworkDocSharedRef) {
  const api: t.WebRtcState<N> = {
    kind: 'WebRtc:State',
    doc,

    /**
     * Current state.
     */
    get current() {
      return doc.current;
    },

    /**
     * Retrieve a new lens with a namespace on the {network.props} object.
     */
    props<T extends {}>(namespace: N, initial: T) {
      return Crdt.lens<t.NetworkDocShared, T>(doc, (draft) => {
        const network = draft.network;
        const props = network.props || (network.props = {});
        const subject = props[namespace] || (props[namespace] = initial ?? {});
        return subject as T;
      });
    },
  };

  return api;
}
