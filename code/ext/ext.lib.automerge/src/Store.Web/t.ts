import type { t } from './common';

/**
 * Store (a repository of documents) that runs on the browser.
 */
export type WebStore = t.Store & {
  Provider(props: { children?: React.ReactNode }): JSX.Element;
  readonly info: WebStoreInfo;
};

export type WebStoreInfo = {
  readonly storage?: { readonly kind: 'IndexedDb'; readonly name: string };
  readonly network?: { readonly kinds: t.StoreNetworkKind[] };
};
