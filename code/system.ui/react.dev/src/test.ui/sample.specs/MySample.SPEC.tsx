import { useState } from 'react';

import { expect } from 'chai';

import { DevBus } from '../../logic.Bus';
import { Color, COLORS, css, Spec } from '../common';
import { DevTools } from '../sample.DevTools';
import { MySample } from './MySample';

import { Keyboard } from 'sys.ui.dom';

let _renderCount = 0;

type T = { count: number; throwError?: boolean };
const initial = { count: 0 };

export default Spec.describe('MySample', (e) => {
  e.it('init', async (e) => {
    _renderCount++;
    const ctx = Spec.ctx(e);
    const state = await ctx.state<T>({ count: 0 });

    expect(state.current.count).to.eql(0); // NB: assertions will be run within CI.

    Keyboard.on('CMD + KeyK', (e) => {
      // NB: Test helpful to ensure errors don't occur on headless run (aka. server/CI).
      console.log('keyboard', e.pattern);
    });

    ctx.subject
      .size(300, 200)
      .display('flex')
      .backgroundColor('rgba(255, 0, 0, 0.1)' /* RED */)
      .render<T>((e) => {
        const text = `MySample-${_renderCount}`;
        return (
          <MySample
            style={{ flex: 1 }}
            text={text}
            data={{ count: e.state.count }}
            throwError={e.state.throwError}
            onClick={() => {
              ctx.subject.backgroundColor(1);
              state.change((draft) => draft.count++);
            }}
          />
        );
      });
  });

  e.it('debug panel', async (e) => {
    const ctx = Spec.ctx(e);
    if (!ctx.is.initial) return;

    const dev = DevTools.init(e);
    const debug = ctx.debug;
    const state = await ctx.state<T>(initial);
    const events = DevBus.events(ctx);

    debug.header.padding(0).render(<ComponentSample title={'header'} />);
    debug.footer.border(-0.15).render(<ComponentSample title={'footer'} />);

    debug.row(<ComponentSample title={'simple element'} />);
    debug.row(() => <ComponentSample title={'via function'} />);
    dev.hr();

    dev
      .button((btn) => {
        let _count = 0;
        btn.label('rename (self)').onClick((e) => {
          _count++;
          e.label(`renamed-${_count}`);
        });
      })
      .hr();

    dev
      .button((btn) => btn.label('run specs').onClick((e) => ctx.run()))
      .button((btn) => btn.label('run specs (reset)').onClick((e) => ctx.run({ reset: true })))
      .button((btn) => btn.label('ctx.redraw').onClick(() => ctx.redraw()))
      .button((btn) =>
        btn.label('throw error').onClick((e) => {
          state.change((d) => (d.throwError = true));
        }),
      )
      .hr();

    debug.row(<div>State</div>);
    dev
      .button((btn) => btn.label('increment (+)').onClick((e) => state.change((d) => d.count++)))
      .button((btn) => btn.label('decrement (-)').onClick((e) => state.change((d) => d.count--)))
      .hr();

    debug.row(<div>Harness</div>);
    dev.button((btn) => {
      let _count = 0;
      btn.label('get info').onClick(async (e) => {
        _count++;
        const info = await events.info.get();
        console.group('🌳 info');
        console.info('info', info);
        console.info('info.render.props:', info.render.props);
        console.info('info.render.props.debug:', info.render.props?.debug);
        e.label(`get info-${_count}`);
        console.groupEnd();
      });
    });

    dev.button((btn) => {
      btn.label('redraw: subject').onClick((e) => events.redraw.subject());
    });

    dev
      .hr()
      .button((btn) => btn.label('size: 300, 200').onClick((e) => e.ctx.subject.size(300, 140)))
      .button((btn) => btn.label('size: fill').onClick((e) => e.ctx.subject.size('fill')))
      .button((btn) => btn.label('size: fill-x').onClick((e) => e.ctx.subject.size('fill-x')))
      .button((btn) => btn.label('size: fill-y').onClick((e) => e.ctx.subject.size('fill-y')))
      .hr();

    debug.row(<div>Host</div>);
    dev
      .button((btn) =>
        btn
          .label('theme: light')
          .onClick((e) => ctx.host.backgroundColor(null).tracelineColor(null)),
      )

      .button((btn) =>
        btn
          .label('theme: dark')
          .onClick((e) => ctx.host.backgroundColor(COLORS.DARK).tracelineColor(0.1)),
      )
      .button((btn) =>
        btn.label('background image: "url"').onClick((e) => {
          const url =
            'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80';
          ctx.host.backgroundImage({ url, margin: 60, opacity: 0.3 });
        }),
      )
      .button((btn) =>
        btn.label('background image: null').onClick((e) => ctx.host.backgroundImage(null)),
      )
      .hr();

    debug.row(<div>Debug Panel</div>);
    dev
      .button((btn) => btn.label('scroll: true').onClick((e) => ctx.debug.scroll(true)))
      .button((btn) => btn.label('scroll: false').onClick((e) => ctx.debug.scroll(false)))
      .button((btn) => btn.label('padding: 0').onClick((e) => ctx.debug.padding(0)))
      .button((btn) => btn.label('padding: [default]').onClick((e) => ctx.debug.padding(null)));
  });
});

/**
 * Helpers
 */

type P = { title?: string };
const ComponentSample = (props: P = {}) => {
  /**
   * NOTE: ensuring hooks behave as expected.
   */
  const [isOver, setOver] = useState(false);
  const over = (isOver: boolean) => () => setOver(isOver);

  const { title = 'Plain Component' } = props;
  const styles = {
    base: css({
      padding: 7,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      cursor: 'default',
    }),
    inner: css({
      Padding: [5, 10],
      border: `dashed 1px ${Color.format(-0.25)}`,
      borderRadius: 7,
    }),
  };
  return (
    <div {...styles.base}>
      <div {...styles.inner} onMouseEnter={over(true)} onMouseLeave={over(false)}>
        {title}
        {isOver ? ' - over' : ''}
      </div>
    </div>
  );
};
