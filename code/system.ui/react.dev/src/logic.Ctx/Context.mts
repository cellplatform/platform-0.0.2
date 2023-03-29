import { BusEvents } from '../logic.Bus/Bus.Events.mjs';
import { type t } from './common';
import { ContextState } from './Context.State.mjs';
import { CtxProps } from './Ctx.Props.mjs';

type O = Record<string, unknown>;

export const Context = {
  /**
   * Create a new instance of the Context logic.
   */
  async init(instance: t.DevInstance, options?: { dispose$: t.Observable<any> }) {
    const events = BusEvents({ instance, dispose$: options?.dispose$ });
    const props = await CtxProps(events);
    const { dispose, dispose$ } = events;

    let _state: t.DevCtxState<O> | undefined;
    const Session = {
      id: '',
      count: 0,
    };

    const toObject = (): t.DevCtxObject => {
      const { id, count } = Session;
      const is = ctx.is;
      return {
        id,
        instance,
        run: { count, is },
        props: { ...props.current },
      };
    };

    const ctx: t.DevCtx = {
      ...props.setters,
      dispose$,
      toObject,

      get is() {
        const initial = Session.count === 0;
        return { initial };
      },

      async run(options = {}) {
        const { only } = options;
        if (options.reset) await events.reset.fire();
        const res = await events.run.fire({ only });
        return res.info ?? (await events.info.get());
      },

      async redraw(all) {
        if (all) {
          const info = await events.info.get();
          const renderers = info.render.props?.debug.body.renderers.map((r) => r.id) ?? [];
          events.redraw.fire(...renderers);
        }
        await events.redraw.subject();
      },

      async state<T extends O>(initial: T) {
        type S = t.DevCtxState<T>;
        if (_state) return _state as S;

        const info = await events.info.get();

        if (info.render.state === undefined) {
          await events.state.change.fire(initial, initial);
        }

        _state = ContextState<T>({
          initial: (info.render.state ?? initial) as T,
          events,
        });

        return _state as S;
      },
    };

    const api: t.DevContext = {
      ctx,
      instance,
      dispose,
      dispose$,
      toObject,

      get disposed() {
        return events.disposed;
      },
      get pending() {
        if (api.disposed) return false;
        return props.pending;
      },

      async refresh() {
        const info = await events.info.get();
        Session.id = info.instance.session;
        Session.count = info.run.count ?? 0;
        return api;
      },

      async flush() {
        if (!api.pending || api.disposed) return api;
        await events.props.change.fire((draft) => {
          const current = props.current;
          draft.subject = current.subject;
          draft.host = current.host;
          draft.debug = current.debug;
        });
        return api;
      },
    };

    await api.refresh();
    return api;
  },
};
