import { TextInputMasks } from '..';
import { Dev, t } from '../../../test.ui';
import { Time, DEFAULTS } from '../common';
import { DevSample } from './DEV.Sample';

type T = {
  props: t.TextInputProps;
  debug: {
    render: boolean;
    status?: t.TextInputStatus;
    isHintEnabled: boolean;
    isUpdateEnabled: boolean;
    isNumericMask: boolean;
  };
  output: Record<string, any>;
  ref?: t.TextInputRef;
};

const initial: T = {
  props: {
    ...DEFAULTS.prop,
    placeholder: 'my placeholder',
    focusOnLoad: true,
  },
  debug: {
    isHintEnabled: true,
    render: true,
    isNumericMask: false,
    isUpdateEnabled: true,
  },
  output: {},
};

export default Dev.describe('TextInput', (e) => {
  e.it('init', async (e) => {
    const ctx = Dev.ctx(e);
    const state = await ctx.state<T>(initial);

    ctx.subject
      .display('grid')
      .size(300, null)
      .render<T>((e) => {
        const { debug } = e.state;
        if (!debug.render) return;

        const autoSize = e.state.props.autoSize;
        if (autoSize) ctx.subject.size('fill-x');
        if (!autoSize) ctx.subject.size(300, null);

        const mask = debug.isNumericMask ? TextInputMasks.isNumeric : undefined;
        const props = { ...e.state.props, mask };
        return (
          <DevSample
            props={props}
            debug={debug}
            onReady={(ref) => {
              console.log('⚡️ onReady:', ref);
              state.change((d) => (d.ref = ref));
            }}
          />
        );
      });
  });

  e.it('debug panel', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev.footer
      .border(-0.1)
      .render<T>((e) => <Dev.Object name={'spec.TextInput'} data={e.state} expand={1} />);

    dev.section('Configurations', (dev) => {
      const value = (value: string, label?: string) => {
        dev.button(`text: ${label ?? value}`, (e) => e.change((d) => (d.props.value = value)));
      };
      value('hello 👋');
      value(dev.lorem(50), 'long (lorem)');
    });

    dev.hr();

    dev.section('Properties', (dev) => {
      function boolean(key: keyof T['props']) {
        dev.boolean((btn) =>
          btn
            .label(key)
            .value((e) => Boolean(e.state.props[key]))
            .onClick((e) => e.change((d) => Dev.toggle(d.props, key))),
        );
      }

      boolean('isEnabled');
      boolean('isReadOnly');
      boolean('isPassword');
      dev.hr();
      boolean('autoCapitalize');
      boolean('autoCorrect');
      boolean('autoComplete');
      boolean('spellCheck');
      dev.hr();
      boolean('autoSize');
      boolean('focusOnLoad');
    });

    dev.TODO(`focusActions: ${DEFAULTS.focusActions.join()}`);

    dev.hr();

    dev.section('Actions', (dev) => {
      type F = (ref: t.TextInputRef) => void;
      const focusThen = (msecs: number, ref: t.TextInputRef, fn: F) => {
        ref.focus();
        Time.delay(msecs, () => fn(ref));
      };
      const action = (label: string, fn: F) => {
        dev.button(label, (e) => {
          const ref = e.state.current.ref;
          if (ref) fn(ref);
        });
      };
      action('focus', (ref) => ref.focus());
      action('focus → blur', (ref) => focusThen(500, ref, () => ref.blur()));
      action('selectAll', (ref) => focusThen(0, ref, () => ref.selectAll()));
      action('cursorToStart', (ref) => focusThen(0, ref, () => ref.cursorToStart()));
      action('cursorToEnd', (ref) => focusThen(0, ref, () => ref.cursorToEnd()));
    });

    dev.hr();

    dev.section('Debug', (dev) => {
      dev.boolean((btn) =>
        btn
          .label('render')
          .value((e) => e.state.debug.render)
          .onClick((e) => e.change((d) => Dev.toggle(d.debug, 'render'))),
      );

      dev.boolean((btn) =>
        btn
          .label((e) => `mask: isNumeric`)
          .value((e) => e.state.debug.isNumericMask)
          .onClick((e) => e.change((d) => Dev.toggle(d.debug, 'isNumericMask'))),
      );

      dev.boolean((btn) =>
        btn
          .label((e) => `hinting (auto-complete)`)
          .value((e) => e.state.debug.isHintEnabled)
          .onClick((e) => e.change((d) => Dev.toggle(d.debug, 'isHintEnabled'))),
      );

      dev.boolean((btn) => {
        const current = (state: T) => (state.debug.isUpdateEnabled ? 'enabled' : 'disabled');
        btn
          .label((e) => `update handler: ${current(e.state)}`)
          .value((e) => e.state.debug.isUpdateEnabled)
          .onClick((e) => e.change((d) => Dev.toggle(d.debug, 'isUpdateEnabled')));
      });
    });

    dev.hr();
  });
});
