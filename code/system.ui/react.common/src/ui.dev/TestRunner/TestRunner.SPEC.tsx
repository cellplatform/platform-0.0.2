import { Dev } from '..';
import { TestRunner } from '.';
import { Color, css, t } from '../common';
import { expect } from '../../test.ui';

import { Results } from './Results';

type T = { results?: t.TestSuiteRunResponse };

const root = Dev.describe('root', (e) => {
  e.it('foo', async (e) => {
    expect(123).to.eql(123);
  });
});

export default Dev.describe('TestRunner', (e) => {
  e.it('init', async (e) => {
    const ctx = Dev.ctx(e);
    ctx.component
      .size('fill')
      .display('grid')
      .backgroundColor(1)
      .render<T>((e) => {
        return (
          <div style={{ padding: 10 }}>
            <Results data={e.state.results} />
          </div>
        );
      });
  });

  e.it('debug panel', async (e) => {
    const dev = Dev.tools<T>(e, {});

    dev.button((btn) =>
      btn.label('🐷').onClick(async (e) => {
        const results = await root.run();
        await e.state.change((draft) => (draft.results = results));
      }),
    );
    dev.hr();

    dev.ctx.debug.row((e) => {
      const styles = {
        base: css({
          backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
          border: `solid 1px ${Color.format(-0.1)}`,
          padding: 15,
        }),
      };
      return <div {...styles.base}>🐷 Debug Panel Runner</div>;
    });
  });
});
