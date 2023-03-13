import { Dev, t } from '.';

type T = {
  debug: { testrunner: { spinning?: boolean; results?: t.TestSuiteRunResponse } };
};
const initial: T = {
  debug: { testrunner: {} },
};

export default Dev.describe('Root', (e) => {
  e.it('init', async (e) => {
    const ctx = Dev.ctx(e);
    await ctx.state<T>(initial);
    ctx.subject
      .backgroundColor(1)
      .size('fill')
      .render<T>((e) => {
        const { spinning, results } = e.state.debug.testrunner;
        return (
          <Dev.TestRunner.Results
            data={results}
            spinning={spinning}
            padding={10}
            scroll={true}
            style={{ Absolute: 0 }}
          />
        );
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev.footer
      .border(-0.1)
      .render<T>((e) => <Dev.Object name={'spec'} data={e.state} expand={1} />);

    dev.section(async (dev) => {
      const invoke = async (spec: t.TestSuiteModel) => {
        await dev.change((d) => (d.debug.testrunner.spinning = true));
        const results = await spec.run();
        await dev.change((d) => {
          d.debug.testrunner.results = results;
          d.debug.testrunner.spinning = false;
        });
      };

      const tests: t.TestSuiteModel[] = [];
      const button = async (input: t.SpecImport, immediate?: boolean) => {
        const module = await input;
        const spec = await (module.default as t.TestSuiteModel).init();
        dev.button((btn) =>
          btn
            .label(spec.description)
            .right(() => (immediate ? '← immediate' : ''))
            .onClick(() => invoke(spec)),
        );
        if (immediate) invoke(spec);
        return spec;
      };

      dev.title('Integration Tests');

      tests.push(
        ...[
          await button(import('../WebRTC/-dev/-TEST.mjs')),
          await button(import('../WebRTC/-dev/-TEST.PeerSyncer.mjs')),
          await button(import('../WebRTC.Media/-TEST.mjs')),
        ],
      );

      dev.hr(5, 20);

      const all = Dev.describe('All Test Suites');
      all.merge(...tests);

      dev.button((btn) =>
        btn
          .label('run all')
          .right('🌳')
          .onClick((e) => invoke(all)),
      );

      /**
       * Immediate invocation of tests.
       */
      // Time.delay(0, () => invoke(all));
    });
  });
});
