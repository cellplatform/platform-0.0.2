import type { Event } from 'sys.types';

type Id = string;

/**
 * Event used to pass a mesage around the network.
 */
export type NetworkMessageEvent = {
  type: 'sys.net/msg';
  payload: NetworkMessage;
};
export type NetworkMessage = {
  tx: Id;
  sender: Id;
  event: Event;
  target?: Id;
};
