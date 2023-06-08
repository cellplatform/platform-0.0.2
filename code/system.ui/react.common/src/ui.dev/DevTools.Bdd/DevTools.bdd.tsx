import { TestRunner } from '../TestRunner';
import { LocalStorage, ValueHandler, type t } from '../common';

type O = Record<string, unknown>;
type R = t.TestPropListRunData;
type MarginInput = t.CssValue['Margin'];
type ModulesInput = R['modules'];
type LocalStore = { selected: string[] };

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
    modules: ValueHandler<{ value: ModulesInput }, S>(events),
    run: ValueHandler<t.DevBddRun, S>(events),
    specs: ValueHandler<t.DevBddSpecs, S>(events),
    enabled: ValueHandler<boolean, S>(events),
    margin: ValueHandler<MarginInput, S>(events),
  };

  let local: LocalStore | undefined;
  const createLocal = (key: string) => {
    const store = LocalStorage<LocalStore>(`${key}:bdd`);
    local = store.object({ selected: [] });
  };

  const args: t.DevBddHandlerArgs<S> = {
    ctx,
    localstore(input) {
      input = (input || '').trim();
      if (input) createLocal(input);
      return args;
    },
    modules(input) {
      const value = Wrangle.modules(input);
      values.modules.handler({ value });
      return args;
    },
    run(input) {
      values.run.handler(input);
      return args;
    },
    specs(input) {
      values.specs.handler(input);
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
    onChanged(handler) {
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
      changeHandlers.forEach((fn) => fn({ ...args, dev, state, change, ...e }));
    };

    const isEnabled = values.enabled.current !== false;
    const list = values.modules.current?.value;

    const run = values.run.current;
    const specs = values.specs.current;
    const data: t.TestPropListData = {
      run: {
        modules: list,
        ctx: run?.ctx,
        infoUrl: run?.infoUrl,
        label: run?.label,
        button: run?.button,
      },
      specs: {
        selected: local?.selected,
        selectable: specs?.selectable,
        ellipsis: specs?.ellipsis,
      },
    };

    return (
      <TestRunner.PropList.Controlled
        initial={data}
        margin={values.margin.current}
        enabled={isEnabled}
        onChanged={(e) => {
          if (local) local.selected = e.selected;
          onChange(e);
        }}
      />
    );
  });

  Object.values(values).forEach((value) => value.subscribe(ref.redraw));
  fn?.(args);
}

/**
 * Helpers
 */
const Wrangle = {
  modules(input: ModulesInput | t.BundleImport): ModulesInput {
    if (typeof input === 'function') return input;
    return (Array.isArray(input) ? input : [input]) as ModulesInput;
  },
};
