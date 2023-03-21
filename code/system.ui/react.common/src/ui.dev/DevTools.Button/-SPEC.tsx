import { css, Dev } from '../../test.ui';
import { Switch } from '../common';
import { Button } from './ui.Button';

import type { ButtonProps } from './ui.Button';

type T = { count: number; props: ButtonProps; debug: { enabled: boolean } };
const initial: T = {
  count: 0,
  props: { rightElement: <div>123</div>, onClick: (e) => console.info(`⚡️ onClick`) },
  debug: { enabled: true },
};

export default Dev.describe('Button', (e) => {
  e.it('init', async (e) => {
    const ctx = Dev.ctx(e);
    await ctx.state<T>(initial);
    ctx.subject
      .display('grid')
      .size([250, null])
      .render<T>((e) => <Button {...e.state.props} />);
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);

    dev.footer
      .border(-0.1)
      .render<T>((e) => <Dev.Object name={'props'} data={e.state.props} expand={1} />);

    dev.section((dev) => {
      dev
        .button('state: increment count', async (e) => {
          await e.change((d) => d.count++);
          e.label(`state: count-${e.state.current.count}`);
        })
        .button((btn) => {
          let count = 0;
          return btn.label('rename (self)').onClick((e) => {
            count++;
            e.label(`renamed-${count} (within closure)`);
          });
        })
        .button((btn) => {
          return btn
            .label((e) => {
              const bg = e.dev.subject.backgroundColor ?? 0;
              const count = e.state.count;
              return `change props: (props-${bg}) / state-${count}`;
            })
            .onClick((e) => e.ctx.subject.backgroundColor(1));
        })
        /**
         * Shorthand: "label", "onClick" parameter declaration.
         */
        .button('no `onClick`');
    });

    dev.hr();

    dev.section((dev) => {
      dev
        .button('right: clear', (e) => e.change(({ props }) => (props.rightElement = undefined)))
        .button('right: `<Switch>`', (e) =>
          e.change(({ props }) => (props.rightElement = <Switch height={16} />)),
        )
        .button('right: `<div>123</div>`', (e) =>
          e.change(({ props }) => (props.rightElement = <div>123</div>)),
        );
    });

    dev.hr();

    dev.section((dev) => {
      dev.button((btn) =>
        btn
          .label((e) => `sample left`)
          .right((e) => {
            const style = css({
              PaddingX: 10,
              PaddingY: 2,
              borderRadius: 10,
              backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
            });
            return <div {...style}>right element</div>;
          })
          .onClick((e) => {
            console.log('click');
          }),
      );

      dev.button((btn) => btn.label('sample left').right('"right string"'));
    });
    dev.hr();

    dev.section((dev) => {
      dev.boolean((btn) =>
        btn
          .label('debug.enabled')
          .value((e) => e.state.debug.enabled)
          .onClick((e) => e.change((d) => Dev.toggle(d.debug, 'enabled'))),
      );

      dev.button((btn) =>
        btn
          .label((e) => `my button (${e.state.debug.enabled ? 'enabled' : 'disabled'})`)
          .enabled((e) => e.state.debug.enabled)
          .onClick((e) => console.info('click')),
      );
    });

    dev.hr();
  });
});
