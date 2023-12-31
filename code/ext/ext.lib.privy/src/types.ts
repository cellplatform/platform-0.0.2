import type { User as AuthUser } from '@privy-io/react-auth';

export type * from './evm/Balance/types';
export type * from './evm/Chain/types';
export type * from './evm/Wallet/types';

export type * from './http/Exchange/types';

export type * from './ui/ui.Auth/types';
export type * from './ui/ui.Info/types';

/**
 * Authentication
 */
export type AuthEnvKey = 'VITE_PUBLIC_PRIVY_APP_ID' | 'VITE_WALLET_CONNECT_PROJECT_ID';

export type { AuthUser };

export type AuthStatus = {
  ready: boolean;
  authenticated: boolean;
  user?: AuthUser;
};