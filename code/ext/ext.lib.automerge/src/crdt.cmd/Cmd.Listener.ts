import { DEFAULTS, rx, type t, type u } from './common';

type Args<C extends t.CmdType> = {
  tx: string;
  name: u.ExtractResName<C>;
  timeout?: t.Msecs;
  dispose$?: t.UntilObservable;
};

/**
 * Factory for producing callback listeners.
 */
export function listenerFactory<C extends t.CmdType>(
  cmd: t.Cmd<C>,
  args: Args<C>,
): t.CmdListener<C> {
  const { tx, timeout = DEFAULTS.timeout } = args;
  const life = rx.lifecycle(args.dispose$);
  const { dispose, dispose$ } = life;
  const events = cmd.events(dispose$);

  type ResParams = u.ExtractResParams<C>;
  let _result: ResParams | undefined;
  let _status: t.CmdListener<C>['status'] = 'Pending';

  /**
   * Observables.
   */
  const $$ = rx.subject<ResParams>();
  const $ = $$.pipe(rx.takeUntil(life.dispose$));

  /**
   * Listeners.
   */
  events
    .cmd(args.name)
    .pipe(
      rx.filter((e) => e.tx === tx),
      rx.map((e) => e.params as ResParams),
    )
    .subscribe((params) => {
      _status = 'Complete';
      _result = params;
      $$.next(params);
      $$.complete();
      api.dispose();
    });

  /**
   * API
   */
  const api: t.CmdListener<C> = {
    $,

    tx,
    get status() {
      return _status;
    },
    get result() {
      return _result;
    },

    // Lifecycle.
    dispose,
    dispose$,
    get disposed() {
      return life.disposed;
    },
  };
  return api;
}
