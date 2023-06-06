import { TestRunner } from '../TestRunner';
import { ValueHandler, type t } from '../common';

type O = Record<string, unknown>;
type Margin = t.CssValue['Margin'];
type ListInput = t.TestPropListRunData['list'];

/**
 * A BDD test-selector/runner.
 */
export function bdd<S extends O = O>(
  events: t.DevEvents,
  ctx: t.DevCtx,
  initial: S,
  fn: t.DevBddHandler<S>,
) {
  if (!ctx.is.initial) return;

  const changeHandlers = new Set<t.DevBddChangedHandler<S>>();
  const values = {
    localstore: ValueHandler<string, S>(events),
    list: ValueHandler<ListInput, S>(events),
    run: ValueHandler<t.DevBddRunDef, S>(events),
    enabled: ValueHandler<boolean, S>(events),
    margin: ValueHandler<Margin, S>(events),
  };

  const args: t.DevBddHandlerArgs<S> = {
    ctx,
    localstore(input) {
      values.localstore.handler(input);
      return args;
    },
    list(input) {
      values.list.handler(input);
      return args;
    },
    run(input) {
      values.run.handler(input);
      return args;
    },
    margin(input) {
      values.margin.handler(input);
      return args;
    },
    enabled(input) {
      values.enabled.handler(input);
      return args;
    },
    onChange(handler) {
      if (typeof handler === 'function') changeHandlers.add(handler);
      return args;
    },
    redraw(subject) {
      Object.values(values).forEach((value) => value.redraw());
      if (subject) events.redraw.subject();
    },
  };

  const ref = ctx.debug.row(async (e) => {
    const state = await ctx.state<S>(initial);
    const change = state.change;
    const onChange: t.TestPropListChangeHandler = async (e) => {
      const dev = ctx.toObject().props;
      const changed = e;
      changeHandlers.forEach((fn) => fn({ ...args, dev, state, change, event: changed }));
    };

    const isEnabled = values.enabled.current !== false;
    const list = values.list.current;
    const run = values.run.current;
    const data: t.TestPropListData = {
      run: { list, ctx: run?.ctx, infoUrl: run?.infoUrl, label: run?.label },
      specs: {},
    };

    return (
      <TestRunner.PropList.Controlled
        initial={data}
        margin={values.margin.current}
        enabled={isEnabled}
        onChanged={(e) => {
          onChange(e);
        }}
      />
    );
  });

  Object.values(values).forEach((value) => value.subscribe(ref.redraw));
  fn?.(args);
}
