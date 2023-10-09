import { Icons, type t } from '../../../test.ui';

type K = 'left:sample' | 'right:foo' | 'right:bar' | '🌳';

export const Sample = {
  /**
   * Action (Model)
   */
  actions(options: { spinning?: boolean } = {}) {
    const { spinning } = options;
    const action = (
      kind: K,
      options: { width?: number; enabled?: boolean; spinning?: boolean } = {},
    ): t.LabelAction<K> => {
      const { width, enabled } = options;
      return {
        kind,
        width,
        enabled,
        spinning: options.spinning ?? spinning,
        onClick: (e) => console.info('⚡️ action → onClick:', e),
      };
    };
    const left = [
      //
      action('left:sample', { width: 25 }),
      action('🌳', { width: 25 }),
    ];
    const right = [
      //
      action('right:foo', { enabled: false }),
      action('right:bar'),
    ];

    return { left, right };
  },

  /**
   * Visual Renderers
   */
  get renderers(): t.LabelItemRenderers<K> {
    return {
      action(kind) {
        const tree: t.LabelItemRenderer = (e) => {
          return <Icons.ObjectTree size={17} color={e.color} opacity={e.enabled ? 0.9 : 0.3} />;
        };
        const keyboard: t.LabelItemRenderer = (e) => {
          return (
            <Icons.Keyboard.outline size={17} color={e.color} opacity={e.enabled ? 0.9 : 0.3} />
          );
        };
        if (kind === 'right:foo') return tree;
        if (kind === 'right:bar') return tree;
        if (kind === 'left:sample') return keyboard;
        return;
      },
    };
  },
};
