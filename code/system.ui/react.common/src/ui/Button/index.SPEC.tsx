import { Dev, ObjectView } from '../../test.ui';
import { Button, ButtonProps } from './Button';

type T = { count: number; props: ButtonProps };
const initial: T = {
  count: 0,
  props: {
    isEnabled: true,
    block: false,
    tooltip: 'My Button',
    label: 'Hello-🐷',
  },
};

export default Dev.describe('Button', (e) => {
  e.it('init', async (e) => {
    const ctx = Dev.ctx(e);
    await ctx.state<T>(initial);
    ctx.component
      .display('grid')
      .render<T>((e) => <Button {...e.state.props} onClick={(e) => console.info('⚡️ onClick')} />);
  });

  e.it('debug panel', async (e) => {
    const dev = Dev.tools<T>(e, initial);

    dev.ctx.debug.footer
      .border(-0.1)
      .render<T>((e) => <ObjectView name={'state'} data={e.state} />);

    dev
      .boolean((btn) =>
        btn
          .label('isEnabled')
          .value((e) => e.state.props.isEnabled)
          .onClick((e) => e.change(({ props }) => (props.isEnabled = !props.isEnabled))),
      )
      .boolean((btn) =>
        btn
          .label('block')
          .value((e) => e.state.props.block)
          .onClick((e) => e.change(({ props }) => (props.block = !props.block))),
      )
      .hr();

    dev.boolean((btn) =>
      btn
        .label('use label')
        .value((e) => Boolean(e.state.props.label))
        .onClick((e) => {
          e.change(({ props }) => {
            if (Boolean(e.state.current.props.label)) {
              props.label = undefined;
              props.children = <div>Hello Child Element</div>;
            } else {
              props.label = 'Hello-🐷';
              props.children = undefined;
            }
          });
        }),
    );
  });
});
