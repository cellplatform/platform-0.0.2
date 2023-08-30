import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect } from 'react';

import { Wrangle } from './Wrangle';
import { DEFAULTS, Pkg, PropList, t } from './common';
import { FieldLinkWallet } from './field.Link.Wallet';
import { FieldLogin } from './field.Login';
import { FieldModuleVerify } from './field.Module.Verify';

export const List: React.FC<t.InfoProps> = (props) => {
  const {
    enabled = DEFAULTS.enabled,
    fields = DEFAULTS.fields.default,
    clipboard = DEFAULTS.clipboard,
    data = DEFAULTS.data,
  } = props;

  const privy = usePrivy();
  const { wallets } = useWallets();
  const user = privy.user;
  const phone = user?.phone?.number;
  const provider = data.provider;

  const copyable = (label: string, value?: string): t.PropListItem => {
    return {
      label,
      value: {
        data: value ?? '-',
        clipboard: clipboard && enabled ? value && value : false,
      },
    };
  };

  const items = PropList.builder<t.InfoField>()
    .field('Module', { label: 'Module', value: `${Pkg.name}@${Pkg.version}` })
    .field('Module.Verify', () => FieldModuleVerify(data))
    .field('Id.User', () => user && copyable('User Identifier', user.id))
    .field('Id.User.Phone', () => user && copyable('Phone', phone))
    .field('Id.App.Privy', copyable('Privy App', provider?.appId))
    .field('Id.App.WalletConnect', copyable('WalletConnect Project', provider?.walletConnectId))
    .field('Login', () => FieldLogin(privy, fields, enabled))
    .field('Link.Wallet', () => FieldLinkWallet(privy, wallets, enabled))
    .items(fields);

  useEffect(() => {
    props.onChange?.({ status: Wrangle.toStatus(privy), privy });
  }, [Wrangle.toDepFlag(privy)]);

  return (
    <PropList
      title={Wrangle.title(props)}
      items={items}
      width={props.width ?? { min: 230 }}
      defaults={{ clipboard: false }}
      card={props.card}
      flipped={props.flipped}
      padding={props.card ? [20, 25, 30, 25] : undefined}
      margin={props.margin}
      style={props.style}
    />
  );
};
