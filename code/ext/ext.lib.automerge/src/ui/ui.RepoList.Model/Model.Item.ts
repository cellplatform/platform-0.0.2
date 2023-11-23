import { createBehavior } from './Model.Item.b.create';
import { renameBehavior } from './Model.Item.b.rename';
import { eventMonitorBehavior } from './Model.Item.b.monitor';
import { DEFAULTS, Model, type t } from './common';

type Args = { ctx: t.RepoListCtxGet; dispose$?: t.UntilObservable };
type D = t.RepoItemData;

export const ItemModel = {
  initial(args: Args): t.RepoItem {
    const data: D = { mode: 'Add' };
    return {
      editable: false,
      label: '',
      left: { kind: 'Item:Left' },
      right: { kind: 'Item:Right' },
      data,
    };
  },

  /**
   * State wrapper.
   */
  state(args: Args) {
    const { ctx } = args;
    const initial = ItemModel.initial(args);
    const type = DEFAULTS.typename.Item;
    const state = Model.Item.state<t.RepoListAction, D>(initial, { type });
    const events = state.events(args.dispose$);
    const dispatch = Model.Item.commands(state);
    const item: t.RepoItemCtx = { state, events, dispatch };

    /**
     * Behavior controllers.
     */
    createBehavior({ ctx, item });
    renameBehavior({ ctx, item });
    eventMonitorBehavior({ ctx, item });

    /**
     * Finish up.
     */
    return state;
  },
} as const;
