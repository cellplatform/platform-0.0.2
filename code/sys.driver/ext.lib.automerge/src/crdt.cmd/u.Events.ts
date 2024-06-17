import { rx, type t, type u } from './common';
import { Is } from './u.Is';
import { Path } from './u.Path';

type Options = {
  paths?: t.CmdPaths;
  dispose$?: t.UntilObservable;
};

/**
 * Strongly typed events for an abstract CRDT document that has
 * paths within it representing a <Cmd> (Command).
 */
export const Events = {
  /**
   * Events factory.
   */
  create<C extends t.CmdType>(doc?: t.Lens | t.DocRef, options: Options = {}): t.CmdEvents<C> {
    const resolve = Path.resolver(options.paths);
    const paths = resolve.paths;

    const life = rx.lifecycle(options.dispose$);
    const { dispose, dispose$ } = life;
    const { distinctWhile, filter, map } = rx;

    /**
     * Observables.
     */
    const fire = (e: t.CmdEvent) => fire$.next(e);
    const fire$ = rx.subject<t.CmdEvent>();
    const $ = fire$.pipe(rx.takeUntil(dispose$));
    const tx$ = rx.payload<t.CmdTxEvent<C>>($, 'crdt:cmd/tx');
    const error$ = tx$.pipe(rx.filter((e) => !!e.error));

    if (doc) {
      const events = doc.events(dispose$);
      const $ = events.changed$.pipe(
        map((e) => ({ patches: e.patches, doc: resolve.toObject(e.after) })),
      );

      // Tx (Command) ⚡️.
      $.pipe(
        filter((e) => Is.event.countChange(paths, e.patches)),
        distinctWhile((p, n) => p.doc.count === n.doc.count),
      ).subscribe((e) => {
        const { tx, count, name, params, error } = e.doc;
        fire({
          type: 'crdt:cmd/tx',
          payload: { name, params, tx, count, error },
        });
      });
    }

    /**
     * API
     */
    const api: t.CmdEvents<C> = {
      $,
      tx$,
      error$,

      on<N extends C['name']>(name: N, handler?: t.CmdEventsOnHandler<u.CmdTypeMap<C>[N]>) {
        type M = u.CmdTypeMap<C>[N];
        type T = t.CmdTx<M>;
        const res$ = api.tx$.pipe(rx.filter((e) => e.name === name)) as t.Observable<T>;
        if (handler) res$.subscribe((e) => handler(e));
        return res$;
      },

      // Lifecycle.
      dispose,
      dispose$,
      get disposed() {
        return life.disposed;
      },
    };
    return api;
  },
} as const;
