import { DEFAULTS, PropList, type t } from './common';

export const Wrangle = {
  title(props: t.InfoProps) {
    const title = PropList.Wrangle.title(props.title);
    if (!title.margin && props.card) title.margin = [0, 0, 15, 0];
    return title;
  },

  toStatus(privy: t.PrivyInterface): t.AuthStatus {
    const { authenticated, ready } = privy;
    const user = privy.user || undefined;
    delete user?.apple;
    delete user?.discord;
    delete user?.email;
    delete user?.github;
    delete user?.google;
    delete user?.twitter;
    return { authenticated, ready, user };
  },

  privyDeps(privy: t.PrivyInterface) {
    const { authenticated, ready, user } = privy;
    const did = user?.id;
    const wallet = user?.wallet?.address;
    const linked = (user?.linkedAccounts ?? [])
      .map((acc) => {
        if (acc.type === 'wallet') return acc.address;
        if (acc.type === 'phone') return acc.number;
        return '';
      })
      .filter(Boolean);
    return `${authenticated}:${ready}:${did}:${linked}:${wallet}`;
  },

  walletDeps(wallet: t.ConnectedWallet) {
    return `${wallet.address}:${wallet.connectorType}:${wallet.walletClientType}:${wallet.chainId}`;
  },

  chain(data: t.InfoData) {
    return (data.chain?.selected ?? DEFAULTS.data.chain!.selected!) as t.EvmChainName;
  },

  loginMethods(fields: t.InfoField[] = []): t.AuthProviderLoginMethods {
    const DEFAULT = DEFAULTS.loginMethods;
    const LOGIN_METHODS: t.InfoField[] = ['Login', 'Login.SMS', 'Login.SMS'];
    if (!fields.some((field) => LOGIN_METHODS.includes(field))) return DEFAULT;

    const res: t.AuthProviderLoginMethods = [];
    if (fields.includes('Login.SMS')) res.push('sms');
    if (fields.includes('Login.Farcaster')) res.push('farcaster');

    return res.length === 0 ? DEFAULT : res;
  },
} as const;
