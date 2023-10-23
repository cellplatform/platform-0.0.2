import { PatchState, slug, type t } from './common';
import { getFactory } from './PeerModel.get';
import { Wrangle } from './Wrangle';

export function manageDataConnection(args: {
  peer: t.PeerJs;
  model: t.PeerModel;
  state: t.PeerModelState;
}) {
  const { peer, state, model } = args;
  const local = peer.id;
  const dispatch = PatchState.Command.dispatcher<t.PeerModelCmd>(state);
  const Get = getFactory(peer);

  const api = {
    dispatch: {
      connection(action: t.PeerModelConnAction, conn?: t.PeerJsConn, error?: Error) {
        const connection = conn ? Wrangle.dispatchConnection(local, conn) : undefined;
        dispatch({
          type: 'Peer:Connection',
          payload: { tx: slug(), connection, action, error },
        });
      },
    },

    monitor(conn: t.PeerJsConnData) {
      const id = conn.connectionId;
      const connection = Wrangle.dispatchConnection(local, conn);
      conn.on('data', (data) => {
        dispatch({ type: 'Peer:Data', payload: { tx: slug(), connection, data } });
      });
      conn.on('close', () => {
        state.change((d) => (d.connections = d.connections.filter((item) => item.id !== id)));
        model.disconnect(id);
      });
      conn.on('error', (err) => api.dispatch.connection('error', conn, err));
    },

    start: {
      /**
       * Start an outgoing data connection.
       */
      outgoing(remote: string) {
        return new Promise<string>((resolve, reject) => {
          const conn = peer.connect(remote, { reliable: true });
          const id = conn.connectionId;
          state.change((d) => {
            d.connections.push({ kind: 'data', id, open: false, peer: { remote, local } });
          });
          conn.on('open', () => {
            state.change((d) => {
              const item = Get.conn.item(d, id);
              if (item) {
                item.open = true;
                api.dispatch.connection('ready', conn);
                resolve(id);
              }
            });
          });
          api.monitor(conn);
          api.dispatch.connection('start:out', conn);
        });
      },

      /**
       * Start an incoming data connection.
       */
      incoming(conn: t.PeerJsConnData) {
        const exists = Get.conn.exists(state.current, conn.connectionId);
        if (!exists) {
          const id = conn.connectionId;
          const remote = conn.peer;
          const peer = { remote, local };
          state.change((d) => d.connections.push({ kind: 'data', id, open: true, peer }));
          api.monitor(conn);
        }
        api.dispatch.connection('start:in', conn);
        api.dispatch.connection('ready', conn);
      },
    },
  } as const;

  return api;
}
