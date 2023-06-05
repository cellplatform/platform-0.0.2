import { R, Test, type t } from '../common';

/**
 * Helper wrapper for manipulating controlled spec-runner state.
 */
export async function State(initial?: t.TestRunnerPropListData) {
  let _current = await Wrangle.initialState(initial);

  const api = {
    /**
     * State properties:
     */
    get current() {
      return _current;
    },

    get specs() {
      return _current.specs ?? (_current.specs = {});
    },

    get results() {
      const specs = api.specs;
      return specs.results ?? (specs.results = {});
    },

    async all() {
      const imported = await Wrangle.importAndInitialize(_current);
      return imported.map((e) => e.suite);
    },

    async selectAll() {
      const all = await api.all();
      all.forEach((spec) => api.selectSpec(spec.hash()));
    },

    /**
     * Mutation methods:
     */
    selectSpec(hash: string) {
      const selected = api.specs.selected ?? [];
      if (!selected.includes(hash)) {
        _current.specs = {
          ..._current.specs,
          selected: [...selected, hash],
        };
      }
    },

    unselectSpec(hash: string) {
      const selected = api.specs.selected ?? [];
      api.specs.selected = selected.filter((item) => item !== hash);
    },

    runStart(spec: t.TestSuiteModel) {
      const hash = spec.hash();
      api.results[hash] = true;
    },

    runComplete(spec: t.TestSuiteModel, res: t.TestSuiteRunResponse) {
      const hash = spec.hash();
      api.results[hash] = res;
    },

    clearResults() {
      api.specs.results = undefined;
    },
  } as const;

  return api;
}

/**
 * Helpers
 */
const Wrangle = {
  async initialState(initial?: t.TestRunnerPropListData) {
    const data = R.clone<t.TestRunnerPropListData>(initial ?? {});
    const specs = data.specs ?? (data.specs = {});

    const imported = await Wrangle.importAndInitialize(data);
    specs.all = imported.map(({ suite }) => suite);
    specs.selected = specs.selected ?? [];

    return data;
  },

  async importAndInitialize(input?: t.TestRunnerPropListData) {
    const data = input ?? {};
    const specs = data.specs ?? (data.specs = {});
    return Test.import(specs.all ?? [], { init: true });
  },

  ctx(specs: t.TestRunnerPropListSpecsData) {
    const ctx = specs.ctx ?? {};
    return typeof ctx === 'function' ? ctx() : ctx;
  },
};
