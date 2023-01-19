import { Playlist, PlaylistProps } from '.';
import { Dev, t } from '../../test.ui';

const msecs = (seconds: number) => seconds * 1000;

const ITEMS: t.PlaylistItem[] = [
  { text: 'Credibly neutral protocols as public goods.', duration: msecs(120) },
  { text: 'Why did "web2" (centralization) happen?', duration: msecs(62) },
  { text: 'The blockchain trilemma.', duration: msecs(530) },
  { text: 'Blockchain trade-offs.', duration: msecs(125) },
  { text: 'Self-sovereign identity.', duration: msecs(624) },
  { text: 'Individual control.', duration: msecs(342) },
];

type T = { props: PlaylistProps };
const initial: T = {
  props: {
    title: 'Deep dive into decentralization',
    previewTitle: 'programme',
    items: [],
    previewImage:
      'https://user-images.githubusercontent.com/185555/213319665-8128314b-5d8e-4a19-b7f5-2469f09d6690.png',
  },
};

export default Dev.describe('Video.Playlist', (e) => {
  e.it('init', async (e) => {
    const ctx = Dev.ctx(e);
    await ctx.state<T>(initial);

    ctx.host.tracelineColor(-0.05).backgroundColor(1);

    ctx.subject
      .display('grid')
      .size(690, null)
      .render<T>((e) => {
        return <Playlist {...e.state.props} onClick={(e) => console.info(`⚡️ onClick`, e)} />;
      });
  });

  e.it('debug panel', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev.footer
      .border(-0.1)
      .render<T>((e) => <Dev.Object name={'info'} data={e.state} expand={1} />);

    dev
      .section('Environment', (dev) => {
        dev.boolean((btn) =>
          btn
            .label('white background')
            .value((e) => Boolean(e.dev.host.backgroundColor === 1))
            .onClick((e) => {
              const isWhite = e.dev.host.backgroundColor === 1;
              e.ctx.host
                .backgroundColor(isWhite ? -0.03 : 1)
                .tracelineColor(isWhite ? -0.05 : -0.02);
            }),
        );

        const width = (value: number) => {
          dev.button(`width: ${value}px`, (e) => e.ctx.subject.size(value, null));
        };
        width(690);
        width(600);
        width(500);
        width(450);
      })
      .hr();

    dev.section('Configurations', (e) => {
      dev.button('reset: initial', (e) => {
        e.change((d) => {
          /**
           * TODO 🐷
           * return value as "REPLACE" object update in `sys.dev`
           */

          type K = keyof PlaylistProps;
          const keys = Object.keys(initial.props) as K[];
          keys.forEach((key) => ((d.props as any)[key] = initial.props[key]));
        });
      });

      dev.button('reset: empty', (e) => {
        e.change(({ props }) => {
          props.title = undefined;
          props.previewTitle = undefined;
          props.items = undefined;
          props.previewImage = undefined;
        });
      });

      dev.hr();

      dev.boolean((btn) =>
        btn
          .label('previewTitle')
          .value((e) => Boolean(e.state.props.previewTitle))
          .onClick((e) => {
            e.change((d) => {
              const next = d.props.previewTitle ? undefined : initial.props.previewTitle;
              d.props.previewTitle = next;
            });
          }),
      );

      dev.button('title: long', (e) => e.change((d) => (d.props.title = dev.lorem(20, '.'))));
      dev.button('title: short', (e) => e.change((d) => (d.props.title = 'Hello world')));

      dev.hr();

      dev.button(`add: items (${ITEMS.length})`, (e) => e.change((d) => (d.props.items = ITEMS)));
      dev.button('remove: first', (e) =>
        e.change((d) => (d.props.items = (d.props.items || []).slice(1))),
      );
      dev.button('remove: last', (e) =>
        e.change((d) => {
          const items = d.props.items || [];
          d.props.items = items.slice(0, items.length - 1);
        }),
      );
      dev.button('(clear)', (e) => e.change((d) => (d.props.items = undefined)));
    });

    dev.hr();
  });
});
