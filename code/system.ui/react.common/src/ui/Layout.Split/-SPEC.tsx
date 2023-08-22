import { SplitLayout } from '.';
import { COLORS, Color, Dev, css, type t } from '../../test.ui';

const DEFAULTS = SplitLayout.DEFAULTS;

type T = {
  props: t.SplitLayoutProps;
  debug: { samples?: boolean };
};
const initial: T = {
  props: {},
  debug: {},
};
const name = SplitLayout.displayName ?? '';

export default Dev.describe(name, (e) => {
  type LocalStore = Pick<t.SplitLayoutProps, 'debug' | 'split' | 'axis'> &
    Pick<T['debug'], 'samples'>;
  const localstore = Dev.LocalStorage<LocalStore>('dev:sys.ui.common.Layout.Split');
  const local = localstore.object({
    split: DEFAULTS.split,
    axis: DEFAULTS.axis,
    debug: true,
    samples: true,
  });

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);

    const state = await ctx.state<T>(initial);
    await state.change((d) => {
      d.props.debug = local.debug;
      d.props.axis = local.axis;
      d.props.split = local.split;
      d.props.splitMin = 0.1;
      d.props.splitMax = 0.9;

      d.debug.samples = local.samples;
    });

    ctx.debug.width(330);
    ctx.subject
      .backgroundColor(1)
      .size('fill')
      .display('grid')
      .render<T>((e) => {
        const { props, debug } = e.state;
        if (!debug.samples) return <SplitLayout {...props} />;
        return (
          <SplitLayout {...props}>
            <Sample />
            <Sample
              minHeight={props.axis === 'x' ? 150 : undefined}
              minWidth={props.axis === 'y' ? 220 : undefined}
            />
          </SplitLayout>
        );
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.section('Properties', (dev) => {
      dev.hr(0, 5);
      dev.row((e) => {
        return (
          <SplitLayout.PropEditor
            {...e.state.props}
            title={'split (ratio)'}
            onChange={(e) => {
              state.change((d) => {
                local.split = d.props.split = e.split;
                local.axis = d.props.axis = e.axis;
              });
            }}
          />
        );
      });
    });

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.debug);
        btn
          .label((e) => `debug`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.debug = Dev.toggle(d.props, 'debug'))));
      });

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.debug.samples);
        btn
          .label((e) => `sample child components`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.samples = Dev.toggle(d.debug, 'samples'))));
      });
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();
    dev.footer.border(-0.1).render<T>((e) => {
      const props = e.state.props;
      const split = Number((e.state.props.split ?? 0).toFixed(2));
      const data = {
        props: { ...props, split },
        'props:split': split,
      };
      return <Dev.Object name={name} data={data} expand={2} />;
    });
  });
});

/**
 * Sample Components
 */
export type SampleProps = {
  minHeight?: number;
  minWidth?: number;
  style?: t.CssValue;
};

export const Sample: React.FC<SampleProps> = (props) => {
  const { minHeight, minWidth } = props;
  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.06)' /* RED */,
      border: `dashed 1px ${Color.alpha(COLORS.RED, 0.2)}`,
      boxSizing: 'border-box',
      borderRadius: 8,
      margin: 15,
      padding: 5,
      paddingLeft: 8,
      minHeight,
      minWidth,
    }),
  };

  const elMinHeight = minHeight && <span>{`min-height: ${minHeight}px`}</span>;
  const elMinWidth = minWidth && <span>{`min-width: ${minWidth}px`}</span>;

  return (
    <div {...css(styles.base, props.style)}>
      <div>
        {`🐷 `}
        {elMinWidth}
        {elMinHeight}
      </div>
    </div>
  );
};
