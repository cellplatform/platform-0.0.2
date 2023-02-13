import type { t } from '../common.t';

type R = any | Promise<any>;
type Handler = () => R;

type Suite = {
  (name: string, fn: Handler): R;
  only: Suite;
  skip: Suite;
};
type Test = {
  (name: string, fn: Handler): R;
  only: Test;
  skip: Test;
};

/**
 * Takes a test suite model and transforms it into another
 * test runners format (e.g. Vitest, Mocha, etc).
 */
export function Transform(describe: Suite, it: Test) {
  const api = {
    /**
     * Transform a test-suite.
     */
    async suite(suite: t.TestSuiteModel) {
      if (!suite.state.ready) await suite.init();

      const handler = (test: t.TestModel) => {
        return async () => {
          const res = await test.run();
          if (!res.ok) {
            const err = res.error?.message ?? `Failed test "${test.description}"`;
            throw new Error(err);
          }
        };
      };

      let def: Suite | undefined;
      if (suite.state.modifier === undefined) def = describe;
      if (suite.state.modifier === 'skip') def = describe.skip;
      if (suite.state.modifier === 'only') def = describe.only;

      def?.(suite.description, () => {
        suite.state.tests.forEach((test) => {
          const name = test.description;
          const fn = handler(test);
          if (test.modifier === undefined) it(name, fn);
          if (test.modifier === 'skip') it.skip?.(name, fn);
          if (test.modifier === 'only') it.only?.(name, fn);
        });

        suite.state.children.forEach((child) => {
          api.suite(child); // <== RECURSION 🌳
        });
      });
    },
  };

  return api;
}
