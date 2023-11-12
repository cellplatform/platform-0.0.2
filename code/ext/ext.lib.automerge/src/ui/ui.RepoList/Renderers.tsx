import { COLORS, Data, DocUri, Hash, Icons, css, type t } from './common';

export const Renderers = {
  /**
   * Initilise the router for the <Component>'s that render within an item.
   */
  init(): t.RepoItemRenderers {
    return {
      label(e) {
        const data = Data.item(e.item);
        if (data.mode === 'Add') return;
        if (!e.item.label) return;
        return <>{e.item.label}</>;
      },

      placeholder(e) {
        const data = Data.item(e.item);
        if (data.mode === 'Add') {
          return <>{'new document'}</>;
        }
        if (data.mode === 'Doc') {
          const style = css({
            fontFamily: 'monospace',
            fontSize: 11,
          });
          const uri = Wrangle.placeholderUri(data.uri);
          return <div {...style}>{uri}</div>;
        }
        return <>{'placeholder'}</>;
      },

      action(e, helpers) {
        if (e.kind === 'Store:Left') {
          const data = Data.item(e.item);

          if (data.mode === 'Add') {
            const color = e.focused ? e.color : COLORS.BLUE;
            return <Icons.Add {...helpers.icon(e, 17)} color={color} />;
          }

          if (data.mode === 'Doc') {
            return <Icons.Database {...helpers.icon(e, 18)} />;
          }
        }
        return;
      },
    };
  },
};

/**
 * Helpers
 */
export const Wrangle = {
  placeholderUri(text?: string) {
    if (!text) return 'doc: uri';
    const id = DocUri.id(text);
    const hash = Hash.shorten(id, [2, 4]);
    return `crdt:${hash}`;
  },
} as const;
