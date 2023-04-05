import { PropList } from '.';
import { Dev, t } from '../../../test.ui';
import { BuilderSample, sampleItems, SampleFields } from '.';

import type { MyFields } from '.';

type SampleKind = 'Samples' | 'Builder' | 'Empty';
type T = {
  props: t.PropListProps;
  debug: {
    source: SampleKind;
    fields?: MyFields[];
    fieldSelector: {
      title: boolean;
      resettable: boolean;
      showIndexes: boolean;
    };
  };
};

const initial: T = {
  props: {
    title: 'MyTitle',
    titleMargin: undefined,
    titleEllipsis: true,
    defaults: { clipboard: false },
    theme: 'Light',
  },
  debug: {
    source: 'Samples',
    fieldSelector: {
      title: true,
      resettable: PropList.FieldSelector.DEFAULT.resettable,
      showIndexes: PropList.FieldSelector.DEFAULT.showIndexes,
    },
  },
};

export default Dev.describe('PropList', (e) => {
  e.it('init', async (e) => {
    const ctx = Dev.ctx(e);
    const state = await ctx.state<T>(initial);
    await Util.setSample(ctx, state.current.debug.source);

    ctx.subject
      .display('grid')
      .size([250, null])
      .render<T>((e) => <PropList {...e.state.props} />);
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const ctx = dev.ctx;

    dev.footer
      .border(-0.1)
      .render<T>((e) => <Dev.Object name={'PropList'} data={e.state} expand={1} />);

    dev.section('Properties', (dev) => {
      dev.boolean((btn) =>
        btn
          .label((e) => `theme: "${e.state.props.theme}"`)
          .value((e) => e.state.props.theme === 'Light')
          .onClick((e) =>
            e.change((d) => {
              d.props.theme = e.current ? 'Dark' : 'Light';
              dev.theme(d.props.theme);
            }),
          ),
      );

      dev.boolean((btn) =>
        btn
          .label('defaults.clipboard')
          .value((e) => e.state.props.defaults?.clipboard)
          .onClick((e) => e.change((d) => Dev.toggle(Util.defaults(d.props), 'clipboard'))),
      );

      dev.boolean((btn) =>
        btn
          .label('defaults.monospace')
          .value((e) => e.state.props.defaults?.monospace)
          .onClick((e) => e.change((d) => Dev.toggle(Util.defaults(d.props), 'monospace'))),
      );

      dev.hr(-1, 5);

      dev.button('toggle: titleMargin', (e) => {
        const current = e.state.current.props.titleMargin;
        e.change((d) => (d.props.titleMargin = current ? undefined : [30, 50]));
      });

      dev.hr(5, 20);
    });

    dev.section('Title', (dev) => {
      dev.button('none (undefined)', (e) => e.change((d) => (d.props.title = undefined)));
      dev.button('"MyTitle"', (e) => e.change((d) => (d.props.title = 'MyTitle')));
      dev.button('long (50 words)', (e) => e.change((d) => (d.props.title = Dev.Lorem.words(50))));
    });

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      const button = (kind: SampleKind) => {
        const label = `items: ${kind}`;
        dev.button(label, (e) => Util.setSample(e.ctx, kind));
      };
      button('Empty');
      button('Samples');
      button('Builder');
    });

    dev.hr(5, 20);

    dev.section((dev) => {
      const bool = (key: keyof T['debug']['fieldSelector']) =>
        dev.boolean((btn) => {
          btn
            .label(`FieldSelector.${key}`)
            .value((e) => e.state.debug.fieldSelector[key])
            .onClick((e) => e.change((d) => (d.debug.fieldSelector[key] = !e.current)));
        });
      bool('title');
      bool('showIndexes');
      bool('resettable');

      dev.row((e) => {
        const debug = e.state.debug;
        const fieldSelector = debug.fieldSelector;
        const props: t.PropListFieldSelectorProps<MyFields> = {
          all: SampleFields.all,
          selected: debug.fields,
          title: fieldSelector.title ? 'Field Selector' : undefined,
          resettable: fieldSelector.resettable,
          showIndexes: fieldSelector.showIndexes,
          async onClick(ev) {
            await dev.change((d) => (d.debug.fields = ev.next as MyFields[]));
            Util.setSample(dev.ctx, 'Builder');
            console.log('⚡️ FieldSelector.onClick:', ev);
          },
        };

        return <PropList.FieldSelector {...props} style={{ Margin: [25, 25, 25, 38] }} />;
      });
    });
  });
});

/**
 * [Helpers]
 */

const Util = {
  async setSample(ctx: t.DevCtx, source: SampleKind) {
    const state = await ctx.state<T>(initial);
    state.change((d) => {
      d.debug.source = source;
      d.props.items = Util.toItems(d);
    });
  },

  toItems(state: T) {
    const { source, fields } = state.debug;
    if (source === 'Empty') return [];
    if (source === 'Samples') return sampleItems;
    if (source === 'Builder') return BuilderSample.toItems({ fields });
    return [];
  },

  defaults(props: t.PropListProps) {
    return props.defaults ?? (props.defaults = {});
  },
};
