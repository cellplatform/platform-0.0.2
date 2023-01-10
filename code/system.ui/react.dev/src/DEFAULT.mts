import type * as t from './common/types.mjs';
import { Color, COLORS } from './common';

export const DEFAULT = {
  get props(): t.DevRenderProps {
    return {
      host: {
        backgroundColor: Color.alpha(COLORS.DARK, 0.02),
        tracelineColor: Color.alpha(COLORS.DARK, 0.1),
      },
      component: {},
      debug: {
        width: 400,
        header: { border: {}, padding: [8, 8, 8, 8] },
        body: {
          renderers: [],
          scroll: true,
          padding: [15, 15, 15, 15],
        },
        footer: { border: {}, padding: [8, 8, 8, 8] },
      },
    };
  },

  get info(): t.DevInfo {
    return {
      instance: { kind: 'dev:harness', session: '', bus: '' },
      render: { revision: { props: 0, state: 0 } },
      run: { count: 0 },
    };
  },

  /**
   * URL query-string keys.
   */
  QS: {
    D: 'd', // NB: alias for "?dev"
    DEV: 'dev',
  },
};
