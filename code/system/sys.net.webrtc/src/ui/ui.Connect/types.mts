import { type t } from './common';

export type Common = {
  edge?: t.VEdge;
  fields?: t.WebRtcInfoField[];
  showInfo?: boolean;
  showInfoAsCard?: boolean;
  style?: t.CssValue;
  margin?: t.CssEdgesInput;
};

export type ConnectProps = Common & {
  client?: t.WebRtcEvents;
  info?: t.WebRtcInfoData;
  loading?: boolean;
  copiedMessage?: string;
};

export type ConnectStatefulProps = Common & {
  self?: t.Peer;
  onChange?: ConnectChangedHandler;
};

/**
 * Events
 */
export type ConnectChangedHandler = (e: ConnectChangedHandlerArgs) => void;
export type ConnectChangedHandlerArgs = {
  readonly client: t.WebRtcEvents;
  readonly selected?: t.PeerId;
};
