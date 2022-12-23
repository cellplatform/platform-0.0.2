import { Context } from '../logic.Ctx';
import { BusEvents } from './Bus.Events.mjs';
import { BusMemoryState } from './Bus.MemoryState.mjs';
import { DEFAULT, Is, rx, t, Test } from './common';

type Id = string;

/**
 * Event controller.
 */
export function BusController(args: {
  instance: { bus: t.EventBus<any>; id: Id };
  filter?: (e: t.DevEvent) => boolean;
  dispose$?: t.Observable<any>;
}): t.DevEvents {
  const bus = rx.busAsType<t.DevEvent>(args.instance.bus);
  const instance = args.instance.id;

  const events = BusEvents({
    instance: args.instance,
    dispose$: args.dispose$,
    filter: args.filter,
  });
  const { dispose$ } = events;

  const state = BusMemoryState({
    instance: args.instance,
    onChanged(e) {
      const { message, info } = e;
      bus.fire({
        type: 'sys.dev/info:changed',
        payload: { instance, message, info },
      });
    },
  });

  const Ctx = {
    _: undefined as t.DevContext | undefined,
    async current() {
      return Ctx._ || (Ctx._ = await Ctx.init());
    },
    async init() {
      const context = await Context.init(args.instance, { dispose$ });
      await state.change('context:init', (draft) => Ctx.resetInfo(draft));
      return context;
    },
    resetInfo(draft: t.DevInfo) {
      draft.render.props = undefined;
      draft.render.state = undefined;
      draft.run = { count: 0 };
    },
  };

  /**
   * Info (Module)
   */
  events.info.req$.subscribe(async (e) => {
    const { tx } = e;
    const info = state.current;
    bus.fire({
      type: 'sys.dev/info:res',
      payload: { tx, instance, info },
    });
  });

  /**
   * Load root spec
   */
  events.load.req$.subscribe(async (e) => {
    const { tx } = e;
    let error: string | undefined;

    try {
      const root = e.bundle ? await Test.bundle(e.bundle) : undefined;
      await events.reset.fire();
      await state.change('spec:load', (draft) => (draft.root = root));
    } catch (err: any) {
      error = err.message;
    }

    const info = state.current;
    bus.fire({
      type: 'sys.dev/load:res',
      payload: { tx, instance, info, error },
    });
  });
  /**
   * Context: Reset.
   */
  events.reset.req$.subscribe(async (e) => {
    const { tx } = e;

    await state.change('reset', (draft) => {
      draft.instance.context = DEFAULT.ctxId();
      Ctx.resetInfo(draft);
    });
    await Ctx.current();

    bus.fire({
      type: 'sys.dev/reset:res',
      payload: { tx, instance, info: state.current },
    });
  });

  /**
   * Run the test suite.
   */
  events.run.req$.subscribe(async (e) => {
    const { tx, only } = e;
    const rootSpec = state.current.root;
    let error: string | undefined;

    try {
      if (rootSpec) {
        const context = await Ctx.current();
        await context.refresh();

        const ctx = context.ctx;
        const results = await rootSpec.run({ ctx, only });
        await context.flush(); // Flush the results from the {ctx} into the state tree: {render.props}.

        /**
         * Update the state tree with the run results.
         */
        const message: t.DevInfoChangeMessage = only ? 'run:subset' : 'run:all';
        await state.change(message, (draft) => {
          draft.run.count++;
          draft.run.results = results;
        });
      }
    } catch (err: any) {
      error = err.message;
    }

    bus.fire({
      type: 'sys.dev/run:res',
      payload: { tx, instance, info: state.current, error },
    });
  });

  /**
   * State: Write.
   */
  events.state.change.req$.subscribe(async (e) => {
    const { tx } = e;
    let error: string | undefined;

    state.change('state:write', async (draft) => {
      const state = draft.render.state || (draft.render.state = { ...e.initial });
      const res = e.mutate(state);
      if (Is.promise(res)) await res;
    });

    bus.fire({
      type: 'sys.dev/state/change:res',
      payload: { tx, instance, info: state.current, error },
    });
  });

  /**
   * Props: Write.
   */
  events.props.change.req$.subscribe(async (e) => {
    const { tx } = e;
    let error: string | undefined;

    state.change('props:write', async (draft) => {
      const props = draft.render.props || (draft.render.props = DEFAULT.props());
      const res = e.mutate(props);
      if (Is.promise(res)) await res;
    });

    bus.fire({
      type: 'sys.dev/props/change:res',
      payload: { tx, instance, info: state.current, error },
    });
  });

  /**
   * API
   */
  return events;
}
