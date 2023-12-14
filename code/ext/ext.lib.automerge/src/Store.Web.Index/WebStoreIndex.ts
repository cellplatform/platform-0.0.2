import { Store } from '../Store';
import { StoreIndexDb } from '../Store.Web.IndexDb';
import { type t } from './common';

export const WebStoreIndex = {
  Doc: Store.Doc,
  Filter: Store.Index.Filter,

  /**
   * Create instance of the store/repo's document Index.
   */
  async init(store: t.WebStore): Promise<t.WebStoreIndex> {
    const dbname = StoreIndexDb.name(store);
    const db = await StoreIndexDb.init(dbname);
    const record = await db.getOrCreate(store);
    const uri = record.index;
    const base = await Store.Index.init(store, { uri });
    return {
      ...base,
      total() {
        return base.total();
      },
      db,
    };
  },
} as const;
